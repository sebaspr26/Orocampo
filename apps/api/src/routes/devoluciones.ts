import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /devoluciones
router.get("/", requireRole("Root", "Administrador", "Secretaria"), async (_req, res) => {
  try {
    const devoluciones = await prisma.devolucion.findMany({
      include: {
        cliente: { select: { id: true, nombre: true } },
        venta: { select: { id: true, total: true } },
        items: { include: { productType: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ devoluciones });
  } catch {
    res.status(500).json({ error: "Error al obtener devoluciones" });
  }
});

// POST /devoluciones
router.post("/", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req: AuthRequest, res) => {
  const { clienteId, ventaId, motivo, items } = req.body;
  if (!clienteId || !motivo || !items || items.length === 0) {
    res.status(400).json({ error: "clienteId, motivo e items son requeridos" });
    return;
  }
  try {
    const devolucion = await prisma.$transaction(async (tx) => {
      const nueva = await tx.devolucion.create({
        data: {
          clienteId,
          ventaId: ventaId || null,
          motivo,
          createdById: req.user!.id,
          items: {
            create: items.map((item: { productTypeId: string; cantidadKg: number; razon: string }) => ({
              productTypeId: item.productTypeId,
              cantidadKg: item.cantidadKg,
              razon: item.razon,
            })),
          },
        },
        include: {
          cliente: { select: { id: true, nombre: true } },
          venta: { select: { id: true, total: true } },
          items: { include: { productType: { select: { id: true, name: true } } } },
        },
      });

      // Reintegrar al inventario solo si la razón es CLIENTE_RECHAZO (producto aún vendible)
      for (const item of items) {
        if (item.razon === "CLIENTE_RECHAZO") {
          const entries = await tx.inventoryEntry.findMany({
            where: { productTypeId: item.productTypeId, remainingKg: { gt: 0 } },
            orderBy: { expiryDate: "asc" },
            take: 1,
          });
          if (entries.length > 0) {
            await tx.inventoryEntry.update({
              where: { id: entries[0].id },
              data: { remainingKg: { increment: item.cantidadKg } },
            });
            await tx.stockMovement.create({
              data: {
                entryId: entries[0].id,
                type: "ENTRADA",
                quantityKg: item.cantidadKg,
                reason: `Devolución cliente: ${nueva.cliente.nombre}`,
                createdById: req.user!.id,
              },
            });
          }
        } else {
          // VENCIDO / MAL_ESTADO / EXCESO → baja de inventario (ya deducido en venta, registrar movimiento informativo)
          const entries = await tx.inventoryEntry.findMany({
            where: { productTypeId: item.productTypeId },
            orderBy: { expiryDate: "asc" },
            take: 1,
          });
          if (entries.length > 0) {
            await tx.stockMovement.create({
              data: {
                entryId: entries[0].id,
                type: "BAJA",
                quantityKg: item.cantidadKg,
                reason: `Devolución ${item.razon}: ${nueva.cliente.nombre}`,
                createdById: req.user!.id,
              },
            });
          }
        }
      }

      return nueva;
    });

    res.status(201).json({ devolucion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar devolución" });
  }
});

// GET /devoluciones/reporte
router.get("/reporte", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  const { desde, hasta } = req.query as Record<string, string>;
  const from = desde ? new Date(desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);
  const to = hasta ? new Date(hasta) : new Date();
  to.setHours(23, 59, 59, 999);

  try {
    const devoluciones = await prisma.devolucion.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: {
        items: { include: { productType: { select: { name: true } } } },
      },
    });

    const perdidas: Record<string, { nombre: string; totalKg: number; count: number }> = {};
    let totalKgDevuelto = 0;

    for (const d of devoluciones) {
      for (const item of d.items) {
        const key = item.productTypeId;
        if (!perdidas[key]) perdidas[key] = { nombre: item.productType.name, totalKg: 0, count: 0 };
        perdidas[key].totalKg += item.cantidadKg;
        perdidas[key].count++;
        totalKgDevuelto += item.cantidadKg;
      }
    }

    const rows = Object.entries(perdidas).map(([id, g]) => ({
      productTypeId: id,
      nombre: g.nombre,
      totalKg: Math.round(g.totalKg * 100) / 100,
      numDevoluciones: g.count,
    })).sort((a, b) => b.totalKg - a.totalKg);

    res.json({
      rows,
      totalDevoluciones: devoluciones.length,
      totalKgDevuelto: Math.round(totalKgDevuelto * 100) / 100,
    });
  } catch {
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

export default router;

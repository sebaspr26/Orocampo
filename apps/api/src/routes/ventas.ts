import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /ventas
router.get("/", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req: AuthRequest, res) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        cliente: { select: { id: true, nombre: true } },
        items: {
          include: { productType: { select: { id: true, name: true } } },
        },
        pagos: { select: { monto: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const result = ventas.map((v) => ({
      ...v,
      totalPagado: v.pagos.reduce((sum, p) => sum + p.monto, 0),
    }));

    res.json({ ventas: result });
  } catch {
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});

// POST /ventas
router.post("/", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req: AuthRequest, res) => {
  const { clienteId, metodoPago, notas, items } = req.body;

  if (!clienteId || !metodoPago || !items || items.length === 0) {
    res.status(400).json({ error: "Datos incompletos: clienteId, metodoPago e items son requeridos" });
    return;
  }

  try {
    // Calculate total
    const total = items.reduce((sum: number, item: { cantidadKg: number; precioUnitario: number }) =>
      sum + item.cantidadKg * item.precioUnitario, 0);

    // Determine initial estado
    const estado = metodoPago === "CREDITO" ? "PENDIENTE" : "PAGADA";

    const venta = await prisma.$transaction(async (tx) => {
      // Create venta with items
      const newVenta = await tx.venta.create({
        data: {
          clienteId,
          metodoPago,
          estado,
          total,
          notas,
          createdById: req.user!.id,
          items: {
            create: items.map((item: { productTypeId: string; cantidadKg: number; precioUnitario: number }) => ({
              productTypeId: item.productTypeId,
              cantidadKg: item.cantidadKg,
              precioUnitario: item.precioUnitario,
              subtotal: item.cantidadKg * item.precioUnitario,
            })),
          },
        },
        include: {
          cliente: { select: { id: true, nombre: true } },
          items: { include: { productType: { select: { id: true, name: true } } } },
        },
      });

      // Update inventory for each item - find matching entries and reduce remainingKg
      for (const item of items) {
        const entries = await tx.inventoryEntry.findMany({
          where: {
            productTypeId: item.productTypeId,
            remainingKg: { gt: 0 },
          },
          orderBy: { expiryDate: "asc" }, // FEFO: first expired, first out
        });

        let remaining = item.cantidadKg;
        for (const entry of entries) {
          if (remaining <= 0) break;
          const toDeduct = Math.min(remaining, entry.remainingKg);
          await tx.inventoryEntry.update({
            where: { id: entry.id },
            data: { remainingKg: entry.remainingKg - toDeduct },
          });
          await tx.stockMovement.create({
            data: {
              entryId: entry.id,
              type: "SALIDA",
              quantityKg: toDeduct,
              reason: `Venta #${newVenta.id.slice(-8)} - Cliente: ${newVenta.cliente.nombre}`,
              createdById: req.user!.id,
            },
          });
          remaining -= toDeduct;
        }
      }

      // If payment method is not CREDITO, create a payment record
      if (metodoPago !== "CREDITO") {
        await tx.pago.create({
          data: {
            clienteId,
            ventaId: newVenta.id,
            monto: total,
            metodoPago,
            createdById: req.user!.id,
          },
        });
      }

      return newVenta;
    });

    res.json({ venta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear venta" });
  }
});

// PATCH /ventas/:id/estado
router.patch("/:id/estado", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  const { estado } = req.body;
  if (!["PENDIENTE", "PAGADA", "ANULADA"].includes(estado)) {
    res.status(400).json({ error: "Estado inválido" });
    return;
  }
  try {
    const venta = await prisma.venta.update({
      where: { id: req.params.id as string },
      data: { estado },
    });
    res.json({ venta });
  } catch {
    res.status(500).json({ error: "Error al actualizar venta" });
  }
});

export default router;

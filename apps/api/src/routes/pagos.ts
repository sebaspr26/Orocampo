import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /pagos
router.get("/", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        cliente: { select: { id: true, nombre: true } },
        venta: { select: { id: true, total: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ pagos });
  } catch {
    res.status(500).json({ error: "Error al obtener pagos" });
  }
});

// GET /pagos/resumen
router.get("/resumen", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const pagosHoy = await prisma.pago.findMany({
      where: { fecha: { gte: today, lte: endOfDay } },
    });

    const totalHoy = pagosHoy.reduce((sum, p) => sum + p.monto, 0);
    const efectivoHoy = pagosHoy.filter(p => p.metodoPago === "EFECTIVO").reduce((sum, p) => sum + p.monto, 0);
    const transferenciaHoy = pagosHoy.filter(p => p.metodoPago === "TRANSFERENCIA").reduce((sum, p) => sum + p.monto, 0);

    const ventasPendientes = await prisma.venta.aggregate({
      where: { estado: "PENDIENTE" },
      _sum: { total: true },
    });

    res.json({
      totalHoy,
      efectivoHoy,
      transferenciaHoy,
      carteraPendiente: ventasPendientes._sum.total ?? 0,
    });
  } catch {
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});

// POST /pagos
router.post("/", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req: AuthRequest, res) => {
  const { clienteId, ventaId, monto, metodoPago, notas, comprobante } = req.body;

  if (!clienteId || !monto || !metodoPago) {
    res.status(400).json({ error: "clienteId, monto y metodoPago son requeridos" });
    return;
  }

  try {
    const pago = await prisma.$transaction(async (tx) => {
      const newPago = await tx.pago.create({
        data: {
          clienteId,
          ventaId: ventaId || null,
          monto: parseFloat(monto),
          metodoPago,
          notas,
          comprobante: comprobante || null,
          createdById: req.user!.id,
        },
        include: {
          cliente: { select: { id: true, nombre: true } },
          venta: { select: { id: true, total: true } },
        },
      });

      // If linked to a venta, check if fully paid and update estado
      if (ventaId) {
        const venta = await tx.venta.findUnique({
          where: { id: ventaId },
          include: { pagos: true },
        });
        if (venta) {
          const totalPagado = venta.pagos.reduce((sum, p) => sum + p.monto, 0);
          if (totalPagado >= venta.total) {
            await tx.venta.update({
              where: { id: ventaId },
              data: { estado: "PAGADA" },
            });
          }
        }
      }

      return newPago;
    });

    res.json({ pago });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar pago" });
  }
});

export default router;

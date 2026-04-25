import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.use(requireRole("Root", "Administrador", "Secretaria"));

// GET /caja — lista cortes de caja
router.get("/", async (_req, res) => {
  try {
    const cortes = await prisma.corteCaja.findMany({
      orderBy: { fecha: "desc" },
      take: 60,
    });
    res.json({ cortes });
  } catch {
    res.status(500).json({ error: "Error al obtener cortes" });
  }
});

// GET /caja/preview — calcula el corte del día sin guardarlo
router.get("/preview", async (req, res) => {
  const fecha = req.query.fecha as string | undefined;
  const day = fecha ? new Date(fecha) : new Date();
  day.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  try {
    const pagos = await prisma.pago.findMany({
      where: { fecha: { gte: day, lte: end } },
    });
    const totalEfectivo = pagos.filter(p => p.metodoPago === "EFECTIVO").reduce((s, p) => s + p.monto, 0);
    const totalTransferencia = pagos.filter(p => p.metodoPago === "TRANSFERENCIA").reduce((s, p) => s + p.monto, 0);
    const totalCobrado = totalEfectivo + totalTransferencia;

    const ventasPendientes = await prisma.venta.aggregate({
      where: { estado: "PENDIENTE" },
      _sum: { total: true },
    });

    res.json({
      fecha: day.toISOString(),
      totalEfectivo: Math.round(totalEfectivo * 100) / 100,
      totalTransferencia: Math.round(totalTransferencia * 100) / 100,
      totalCobrado: Math.round(totalCobrado * 100) / 100,
      numeroPagos: pagos.length,
      carteraPendiente: ventasPendientes._sum.total ?? 0,
    });
  } catch {
    res.status(500).json({ error: "Error al calcular preview" });
  }
});

// POST /caja — registrar corte/arqueo
router.post("/", async (req: AuthRequest, res) => {
  const { fecha, montoDeclarado, notas } = req.body;
  const day = fecha ? new Date(fecha) : new Date();
  day.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  try {
    const pagos = await prisma.pago.findMany({
      where: { fecha: { gte: day, lte: end } },
    });
    const totalEfectivo = pagos.filter(p => p.metodoPago === "EFECTIVO").reduce((s, p) => s + p.monto, 0);
    const totalTransferencia = pagos.filter(p => p.metodoPago === "TRANSFERENCIA").reduce((s, p) => s + p.monto, 0);

    const declarado = montoDeclarado !== undefined ? parseFloat(montoDeclarado) : null;
    const diferencia = declarado !== null ? Math.round((totalEfectivo - declarado) * 100) / 100 : null;

    const corte = await prisma.corteCaja.create({
      data: {
        fecha: day,
        totalEfectivo: Math.round(totalEfectivo * 100) / 100,
        totalTransferencia: Math.round(totalTransferencia * 100) / 100,
        montoDeclarado: declarado,
        diferencia,
        notas,
        estado: "CERRADO",
        createdById: req.user!.id,
      },
    });

    // Notificación por descuadre
    if (diferencia !== null && Math.abs(diferencia) > 0) {
      await prisma.notification.create({
        data: {
          title: "Descuadre de caja detectado",
          message: `Corte del ${day.toLocaleDateString("es-CO")}: diferencia de $${Math.abs(diferencia).toLocaleString("es-CO")} (${diferencia > 0 ? "faltante" : "sobrante"}).`,
          targetRoles: ["Root", "Administrador"],
          createdById: req.user!.id,
        },
      });
    }

    // Notificación por cartera vencida (> 30 días) al cerrar caja (RF-20)
    const treintaDiasAtras = new Date(day.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ventasVencidas = await prisma.venta.findMany({
      where: { estado: "PENDIENTE", createdAt: { lt: treintaDiasAtras } },
      include: { cliente: { select: { nombre: true } }, pagos: { select: { monto: true } } },
    });
    const carteraVencida = ventasVencidas.reduce((s, v) => {
      const pagado = v.pagos.reduce((sp, p) => sp + p.monto, 0);
      return s + (v.total - pagado);
    }, 0);
    if (carteraVencida > 0) {
      await prisma.notification.create({
        data: {
          title: "Cartera vencida detectada",
          message: `Existen $${Math.round(carteraVencida).toLocaleString("es-CO")} en cartera vencida (facturas con más de 30 días sin pagar). ${ventasVencidas.length} factura(s) afectadas.`,
          targetRoles: ["Root", "Administrador"],
          createdById: req.user!.id,
        },
      });
    }

    res.status(201).json({ corte });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar corte" });
  }
});

export default router;

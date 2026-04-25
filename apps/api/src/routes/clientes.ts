import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /clientes
router.get("/", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        ventas: {
          where: { estado: "PENDIENTE" },
          select: { total: true },
        },
        tipoCliente: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: "asc" },
    });

    const result = clientes.map((c) => ({
      ...c,
      carteraPendiente: c.ventas.reduce((sum, v) => sum + v.total, 0),
      ventasPendientes: c.ventas.length,
    }));

    res.json({ clientes: result });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// POST /clientes
router.post("/", requireRole("Root", "Administrador", "Secretaria"), async (req: AuthRequest, res) => {
  const { nombre, telefono, email, direccion, notas, tipoClienteId } = req.body;
  if (!nombre) {
    res.status(400).json({ error: "El nombre es requerido" });
    return;
  }
  try {
    const cliente = await prisma.cliente.create({
      data: { nombre, telefono, email, direccion, notas, tipoClienteId: tipoClienteId || null },
      include: { tipoCliente: { select: { id: true, nombre: true } } },
    });
    res.json({ cliente });
  } catch (err) {
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

// PUT /clientes/:id
router.put("/:id", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  const { nombre, telefono, email, direccion, notas, tipoClienteId } = req.body;
  try {
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id as string },
      data: { nombre, telefono, email, direccion, notas, tipoClienteId: tipoClienteId || null },
      include: { tipoCliente: { select: { id: true, nombre: true } } },
    });
    res.json({ cliente });
  } catch {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

// PATCH /clientes/:id/toggle
router.patch("/:id/toggle", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  try {
    const current = await prisma.cliente.findUnique({ where: { id: req.params.id as string } });
    if (!current) { res.status(404).json({ error: "Cliente no encontrado" }); return; }
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id as string },
      data: { isActive: !current.isActive },
    });
    res.json({ cliente });
  } catch {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

// GET /clientes/:id/estado-cuenta — estado de cuenta detallado (RF-21)
router.get("/:id/estado-cuenta", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (req, res) => {
  try {
    const clienteId = req.params.id as string;
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true, nombre: true, telefono: true, email: true, direccion: true } });
    if (!cliente) { res.status(404).json({ error: "Cliente no encontrado" }); return; }

    const ventas = await prisma.venta.findMany({
      where: { clienteId },
      include: {
        items: { include: { productType: { select: { name: true } } } },
        pagos: { select: { id: true, monto: true, metodoPago: true, fecha: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const movimientos = ventas.map(v => {
      const totalPagado = v.pagos.reduce((s, p) => s + p.monto, 0);
      return {
        id: v.id,
        tipo: "VENTA" as const,
        fecha: v.createdAt,
        descripcion: v.items.map(i => `${i.productType.name} ${i.cantidadKg}kg`).join(", "),
        cargo: v.total,
        abono: totalPagado,
        saldo: v.total - totalPagado,
        estado: v.estado,
        metodoPago: v.metodoPago,
        pagos: v.pagos,
      };
    });

    const totalCartera = movimientos.filter(m => m.estado === "PENDIENTE").reduce((s, m) => s + m.saldo, 0);
    const totalFacturado = movimientos.filter(m => m.estado !== "ANULADA").reduce((s, m) => s + m.cargo, 0);
    const totalPagado = movimientos.filter(m => m.estado !== "ANULADA").reduce((s, m) => s + m.abono, 0);

    res.json({
      cliente,
      movimientos,
      resumen: {
        totalFacturado: Math.round(totalFacturado * 100) / 100,
        totalPagado: Math.round(totalPagado * 100) / 100,
        totalCartera: Math.round(totalCartera * 100) / 100,
        numVentas: ventas.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener estado de cuenta" });
  }
});

export default router;

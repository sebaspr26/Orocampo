import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /clientes
router.get("/", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        ventas: {
          where: { estado: "PENDIENTE" },
          select: { total: true },
        },
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
  const { nombre, telefono, email, direccion, notas } = req.body;
  if (!nombre) {
    res.status(400).json({ error: "El nombre es requerido" });
    return;
  }
  try {
    const cliente = await prisma.cliente.create({
      data: { nombre, telefono, email, direccion, notas },
    });
    res.json({ cliente });
  } catch (err) {
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

// PUT /clientes/:id
router.put("/:id", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  const { nombre, telefono, email, direccion, notas } = req.body;
  try {
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id as string },
      data: { nombre, telefono, email, direccion, notas },
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

export default router;

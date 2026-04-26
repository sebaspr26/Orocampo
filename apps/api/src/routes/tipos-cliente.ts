import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.use(requireRole("Root", "Administrador", "Secretaria"));

// GET /tipos-cliente
router.get("/", async (_req, res) => {
  try {
    const tipos = await prisma.tipoCliente.findMany({
      where: { isActive: true },
      include: {
        precios: {
          include: { productType: { select: { id: true, name: true } } },
        },
        _count: { select: { clientes: true } },
      },
      orderBy: { nombre: "asc" },
    });
    res.json({ tipos });
  } catch {
    res.status(500).json({ error: "Error al obtener tipos de cliente" });
  }
});

// POST /tipos-cliente
router.post("/", async (_req: AuthRequest, res) => {
  const { nombre, descripcion } = _req.body;
  if (!nombre) {
    res.status(400).json({ error: "El nombre es requerido" });
    return;
  }
  try {
    const tipo = await prisma.tipoCliente.create({
      data: { nombre, descripcion },
      include: {
        precios: { include: { productType: { select: { id: true, name: true } } } },
        _count: { select: { clientes: true } },
      },
    });
    res.status(201).json({ tipo });
  } catch {
    res.status(500).json({ error: "Error al crear tipo de cliente" });
  }
});

// PUT /tipos-cliente/:id
router.put("/:id", async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const tipo = await prisma.tipoCliente.update({
      where: { id: req.params.id as string },
      data: { nombre, descripcion },
      include: {
        precios: { include: { productType: { select: { id: true, name: true } } } },
        _count: { select: { clientes: true } },
      },
    });
    res.json({ tipo });
  } catch {
    res.status(500).json({ error: "Error al actualizar tipo de cliente" });
  }
});

// DELETE /tipos-cliente/:id
router.delete("/:id", async (req, res) => {
  try {
    const tipoId = req.params.id as string;
    const count = await prisma.cliente.count({ where: { tipoClienteId: tipoId } });
    if (count > 0) {
      res.status(400).json({ error: `No se puede eliminar: ${count} cliente(s) asignado(s)` });
      return;
    }
    await Promise.all([
      prisma.precioTipo.deleteMany({ where: { tipoClienteId: tipoId } }),
      prisma.tipoCliente.update({ where: { id: tipoId }, data: { isActive: false } }),
    ]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar tipo de cliente" });
  }
});

// POST /tipos-cliente/:id/precios — crear o actualizar precio para un producto
router.post("/:id/precios", async (req: AuthRequest, res) => {
  const { productTypeId, precio } = req.body;
  if (!productTypeId || precio === undefined) {
    res.status(400).json({ error: "productTypeId y precio son requeridos" });
    return;
  }
  try {
    const result = await prisma.precioTipo.upsert({
      where: { tipoClienteId_productTypeId: { tipoClienteId: req.params.id as string, productTypeId } },
      update: { precio, createdById: req.user!.id },
      create: { tipoClienteId: req.params.id as string, productTypeId, precio, createdById: req.user!.id },
      include: { productType: { select: { id: true, name: true } } },
    });
    res.json({ precio: result });
  } catch {
    res.status(500).json({ error: "Error al guardar precio" });
  }
});

// DELETE /tipos-cliente/:id/precios/:precioId
router.delete("/:id/precios/:precioId", async (req, res) => {
  try {
    await prisma.precioTipo.delete({ where: { id: req.params.precioId as string } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar precio" });
  }
});

export default router;

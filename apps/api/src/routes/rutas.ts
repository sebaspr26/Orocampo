import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /rutas - lista todas las rutas
router.get("/", requireRole("Root", "Administrador", "Secretaria"), async (_req, res) => {
  try {
    const rutas = await prisma.ruta.findMany({
      where: { isActive: true },
      include: {
        domiciliario: { select: { id: true, name: true, email: true } },
        clientes: { select: { id: true, nombre: true, telefono: true, direccion: true, isActive: true } },
      },
      orderBy: { nombre: "asc" },
    });
    res.json({ rutas });
  } catch {
    res.status(500).json({ error: "Error al obtener rutas" });
  }
});

// GET /rutas/domiciliarios - usuarios con rol Domiciliario
router.get("/domiciliarios", requireRole("Root", "Administrador", "Secretaria"), async (_req, res) => {
  try {
    const domiciliarios = await prisma.user.findMany({
      where: { role: { name: "Domiciliario" }, isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    res.json({ domiciliarios });
  } catch {
    res.status(500).json({ error: "Error al obtener domiciliarios" });
  }
});

// POST /rutas
router.post("/", requireRole("Root", "Administrador"), async (req: AuthRequest, res) => {
  const { nombre, domiciliarioId, clienteIds } = req.body;
  if (!nombre || !domiciliarioId) {
    res.status(400).json({ error: "nombre y domiciliarioId son requeridos" });
    return;
  }
  try {
    const ruta = await prisma.$transaction(async (tx) => {
      const nueva = await tx.ruta.create({
        data: { nombre, domiciliarioId },
      });
      if (clienteIds?.length) {
        await tx.cliente.updateMany({
          where: { id: { in: clienteIds } },
          data: { rutaId: nueva.id },
        });
      }
      return tx.ruta.findUnique({
        where: { id: nueva.id },
        include: {
          domiciliario: { select: { id: true, name: true, email: true } },
          clientes: { select: { id: true, nombre: true, telefono: true, direccion: true, isActive: true } },
        },
      });
    });
    res.status(201).json({ ruta });
  } catch {
    res.status(500).json({ error: "Error al crear ruta" });
  }
});

// PUT /rutas/:id
router.put("/:id", requireRole("Root", "Administrador"), async (req, res) => {
  const { nombre, domiciliarioId, clienteIds } = req.body;
  try {
    const ruta = await prisma.$transaction(async (tx) => {
      const updateData: { nombre?: string; domiciliarioId?: string } = {};
      if (nombre) updateData.nombre = nombre;
      if (domiciliarioId) updateData.domiciliarioId = domiciliarioId;

      await tx.ruta.update({ where: { id: req.params.id }, data: updateData });

      if (clienteIds !== undefined) {
        // Quitar clientes que estaban en esta ruta pero ya no están
        await tx.cliente.updateMany({
          where: { rutaId: req.params.id, id: { notIn: clienteIds } },
          data: { rutaId: null },
        });
        // Asignar los nuevos clientes a esta ruta
        if (clienteIds.length) {
          await tx.cliente.updateMany({
            where: { id: { in: clienteIds } },
            data: { rutaId: req.params.id },
          });
        }
      }

      return tx.ruta.findUnique({
        where: { id: req.params.id },
        include: {
          domiciliario: { select: { id: true, name: true, email: true } },
          clientes: { select: { id: true, nombre: true, telefono: true, direccion: true, isActive: true } },
        },
      });
    });
    res.json({ ruta });
  } catch {
    res.status(500).json({ error: "Error al actualizar ruta" });
  }
});

// DELETE /rutas/:id (soft delete)
router.delete("/:id", requireRole("Root", "Administrador"), async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.cliente.updateMany({ where: { rutaId: req.params.id }, data: { rutaId: null } });
      await tx.ruta.update({ where: { id: req.params.id }, data: { isActive: false } });
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar ruta" });
  }
});

export default router;

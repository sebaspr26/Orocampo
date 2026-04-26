import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /precios — lista precios especiales por cliente
router.get("/", requireRole("Root", "Administrador", "Secretaria"), async (_req, res) => {
  try {
    const precios = await prisma.precioCliente.findMany({
      where: { vigente: true },
      include: {
        cliente: { select: { id: true, nombre: true } },
        productType: { select: { id: true, name: true } },
      },
      orderBy: [{ cliente: { nombre: "asc" } }, { productType: { name: "asc" } }],
    });
    res.json({ precios });
  } catch {
    res.status(500).json({ error: "Error al obtener precios" });
  }
});

router.get("/cliente/:clienteId", async (req, res) => {
  try {
    const clienteId = req.params.clienteId as string;
    const [preciosIndividuales, cliente] = await Promise.all([
      prisma.precioCliente.findMany({
        where: { clienteId, vigente: true },
        include: { productType: { select: { id: true, name: true } } },
      }),
      prisma.cliente.findUnique({
        where: { id: clienteId },
        select: {
          tipoCliente: {
            select: {
              precios: { include: { productType: { select: { id: true, name: true } } } },
            },
          },
        },
      }),
    ]);

    let precios = [...preciosIndividuales] as typeof preciosIndividuales & { fromTipo?: boolean }[];
    if (cliente?.tipoCliente) {
      const cubiertos = new Set(preciosIndividuales.map(p => p.productTypeId));
      const extras = cliente.tipoCliente.precios
        .filter(p => !cubiertos.has(p.productTypeId))
        .map(p => ({ ...p, clienteId, vigente: true, fromTipo: true as const }));
      precios = [...preciosIndividuales, ...extras];
    }

    res.json({ precios });
  } catch {
    res.status(500).json({ error: "Error al obtener precios del cliente" });
  }
});

// GET /precios/historial/:clienteId — historial de cambios para un cliente
router.get("/historial/:clienteId", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  try {
    const historial = await prisma.historialPrecio.findMany({
      where: { clienteId: req.params.clienteId as string },
      include: { productType: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ historial });
  } catch {
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// POST /precios — crear o actualizar precio especial
router.post("/", requireRole("Root", "Administrador", "Secretaria"), async (req: AuthRequest, res) => {
  const { clienteId, productTypeId, precio } = req.body;
  if (!clienteId || !productTypeId || precio === undefined) {
    res.status(400).json({ error: "clienteId, productTypeId y precio son requeridos" });
    return;
  }
  try {
    const existing = await prisma.precioCliente.findUnique({
      where: { clienteId_productTypeId: { clienteId, productTypeId } },
    });

    let result;
    if (existing) {
      if (existing.precio !== precio) {
        await prisma.historialPrecio.create({
          data: {
            clienteId,
            productTypeId,
            precioAnterior: existing.precio,
            precioNuevo: precio,
            createdById: req.user!.id,
          },
        });
      }
      result = await prisma.precioCliente.update({
        where: { clienteId_productTypeId: { clienteId, productTypeId } },
        data: { precio, vigente: true, createdById: req.user!.id },
        include: {
          cliente: { select: { id: true, nombre: true } },
          productType: { select: { id: true, name: true } },
        },
      });
    } else {
      result = await prisma.precioCliente.create({
        data: { clienteId, productTypeId, precio, createdById: req.user!.id },
        include: {
          cliente: { select: { id: true, nombre: true } },
          productType: { select: { id: true, name: true } },
        },
      });
    }

    res.status(201).json({ precio: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar precio" });
  }
});

// DELETE /precios/:id — eliminar precio especial
router.delete("/:id", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  try {
    await prisma.precioCliente.update({
      where: { id: req.params.id as string },
      data: { vigente: false },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar precio" });
  }
});

export default router;

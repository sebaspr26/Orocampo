import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

function addOneYear(date: Date): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

router.get("/", requireRole("Root", "Administrador"), async (_req, res) => {
  try {
    const motos = await prisma.moto.findMany({ orderBy: { placa: "asc" } });
    res.json({ motos });
  } catch {
    res.status(500).json({ error: "Error al obtener motos" });
  }
});

router.get("/alertas", requireRole("Root", "Administrador", "Secretaria", "Domiciliario"), async (_req, res) => {
  try {
    const now = new Date();
    const limite = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const motos = await prisma.moto.findMany({ where: { isActive: true } });

    const alertas: { motoId: string; placa: string; tipo: string; fecha: Date; diasRestantes: number }[] = [];

    for (const moto of motos) {
      if (moto.fechaFinTecno) {
        const dias = Math.ceil((moto.fechaFinTecno.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (dias >= 0 && dias <= 7) {
          alertas.push({ motoId: moto.id, placa: moto.placa, tipo: "Tecnomecánica", fecha: moto.fechaFinTecno, diasRestantes: dias });
        }
      }
      if (moto.fechaFinSeguro) {
        const dias = Math.ceil((moto.fechaFinSeguro.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (dias >= 0 && dias <= 7) {
          alertas.push({ motoId: moto.id, placa: moto.placa, tipo: "Seguro SOAT", fecha: moto.fechaFinSeguro, diasRestantes: dias });
        }
      }
    }

    res.json({ alertas });
  } catch {
    res.status(500).json({ error: "Error al obtener alertas" });
  }
});

router.post("/", requireRole("Root", "Administrador"), async (req: AuthRequest, res) => {
  const { placa, notas, fechaInicioTecno, fechaInicioSeguro, picoYPlaca } = req.body;
  if (!placa?.trim()) { res.status(400).json({ error: "La placa es requerida" }); return; }

  try {
    const moto = await prisma.moto.create({
      data: {
        placa: (placa as string).toUpperCase().trim(),
        notas: notas || null,
        picoYPlaca: picoYPlaca || null,
        fechaInicioTecno: fechaInicioTecno ? new Date(fechaInicioTecno) : null,
        fechaFinTecno: fechaInicioTecno ? addOneYear(new Date(fechaInicioTecno)) : null,
        fechaInicioSeguro: fechaInicioSeguro ? new Date(fechaInicioSeguro) : null,
        fechaFinSeguro: fechaInicioSeguro ? addOneYear(new Date(fechaInicioSeguro)) : null,
        createdById: req.user!.id,
      },
    });
    res.json({ moto });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") { res.status(409).json({ error: "Ya existe una moto con esa placa" }); return; }
    res.status(500).json({ error: "Error al crear moto" });
  }
});

router.put("/:id", requireRole("Root", "Administrador"), async (req: AuthRequest, res) => {
  const { placa, notas, fechaInicioTecno, fechaInicioSeguro, picoYPlaca } = req.body;

  try {
    const moto = await prisma.moto.update({
      where: { id: req.params.id as string },
      data: {
        ...(placa && { placa: (placa as string).toUpperCase().trim() }),
        notas: notas || null,
        picoYPlaca: picoYPlaca || null,
        fechaInicioTecno: fechaInicioTecno ? new Date(fechaInicioTecno) : null,
        fechaFinTecno: fechaInicioTecno ? addOneYear(new Date(fechaInicioTecno)) : null,
        fechaInicioSeguro: fechaInicioSeguro ? new Date(fechaInicioSeguro) : null,
        fechaFinSeguro: fechaInicioSeguro ? addOneYear(new Date(fechaInicioSeguro)) : null,
      },
    });
    res.json({ moto });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") { res.status(409).json({ error: "Ya existe una moto con esa placa" }); return; }
    res.status(500).json({ error: "Error al actualizar moto" });
  }
});

router.patch("/:id/toggle", requireRole("Root", "Administrador"), async (req, res) => {
  try {
    const current = await prisma.moto.findUnique({ where: { id: req.params.id as string } });
    if (!current) { res.status(404).json({ error: "Moto no encontrada" }); return; }
    const moto = await prisma.moto.update({
      where: { id: req.params.id as string },
      data: { isActive: !current.isActive },
    });
    res.json({ moto });
  } catch {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

router.delete("/:id", requireRole("Root"), async (req, res) => {
  try {
    await prisma.moto.delete({ where: { id: req.params.id as string } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar moto" });
  }
});

export default router;

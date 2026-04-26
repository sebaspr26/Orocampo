import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// POST /location — domiciliario envía su ubicación
router.post("/", requireRole("Domiciliario"), async (req: AuthRequest, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) {
    res.status(400).json({ error: "lat y lng son requeridos" });
    return;
  }
  try {
    // Verificar horario laboral
    const settings = await prisma.appSettings.findUnique({ where: { id: "global" } });
    const inicio = settings?.horarioInicio ?? "05:00";
    const fin = settings?.horarioFin ?? "22:00";

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (hhmm < inicio || hhmm > fin) {
      res.json({ saved: false, reason: "fuera_de_horario" });
      return;
    }

    const location = await prisma.location.create({
      data: { userId: req.user!.id, lat, lng },
    });

    // Limpiar ubicaciones >7 días (fire and forget)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    prisma.location.deleteMany({ where: { createdAt: { lt: sevenDaysAgo } } }).catch(() => {});

    res.json({ saved: true, location });
  } catch {
    res.status(500).json({ error: "Error al guardar ubicación" });
  }
});

// GET /location/settings — obtener horario laboral
router.get("/settings", async (_req, res) => {
  try {
    let settings = await prisma.appSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.appSettings.create({ data: { id: "global" } });
    }
    res.json({ settings });
  } catch {
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// PUT /location/settings — admin configura horario laboral
router.put("/settings", requireRole("Root", "Administrador"), async (req: AuthRequest, res) => {
  const { horarioInicio, horarioFin } = req.body;
  try {
    const settings = await prisma.appSettings.upsert({
      where: { id: "global" },
      update: { horarioInicio, horarioFin },
      create: { id: "global", horarioInicio, horarioFin },
    });
    res.json({ settings });
  } catch {
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
});

// GET /location/all — admin ve última ubicación de todos los domiciliarios
router.get("/all", requireRole("Root", "Administrador", "Secretaria"), async (_req, res) => {
  try {
    const domiciliarios = await prisma.user.findMany({
      where: { role: { name: "Domiciliario" }, isActive: true },
      select: { id: true, name: true },
    });

    const locations = await Promise.all(
      domiciliarios.map(async (d) => {
        const last = await prisma.location.findFirst({
          where: { userId: d.id },
          orderBy: { createdAt: "desc" },
        });
        return { userId: d.id, name: d.name, location: last };
      })
    );

    res.json({ locations });
  } catch {
    res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
});

// GET /location/:userId/history — historial del día de un domiciliario
router.get("/:userId/history", requireRole("Root", "Administrador", "Secretaria"), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = await prisma.location.findMany({
      where: {
        userId: req.params.userId as string,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: "asc" },
      select: { lat: true, lng: true, createdAt: true },
    });

    res.json({ history });
  } catch {
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

export default router;

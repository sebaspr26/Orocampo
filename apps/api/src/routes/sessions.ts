import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.use(requireRole("Root"));

// GET /sessions — listar todos los usuarios con estado de sesión móvil
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } },
        mobileSession: {
          select: { deviceToken: true, lastActivity: true, createdAt: true },
        },
      },
      orderBy: [{ role: { name: "asc" } }, { name: "asc" }],
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role?.name ?? "sin_rol",
      mobileSession: u.mobileSession
        ? {
            active: true,
            lastActivity: u.mobileSession.lastActivity,
            since: u.mobileSession.createdAt,
          }
        : null,
    }));

    res.json({ users: result });
  } catch {
    res.status(500).json({ error: "Error al obtener sesiones" });
  }
});

// DELETE /sessions/:userId — force-logout sesión móvil de un usuario
router.delete("/:userId", async (req, res) => {
  try {
    await prisma.mobileSession.deleteMany({
      where: { userId: req.params.userId as string },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
});

export default router;

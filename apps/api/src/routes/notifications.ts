import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  targetRoles: z.array(z.string()).min(1),
});

router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const notifications = await prisma.notification.findMany({
    where: { targetRoles: { has: userRole } },
    orderBy: { createdAt: "desc" },
    include: {
      reads: { where: { userId }, select: { readAt: true } },
    },
  });

  res.json({ notifications });
});

router.get("/sent", requireAuth, requireRole("Root"), async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { createdById: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: { reads: { select: { userId: true } } },
  });

  res.json({ notifications });
});

router.post("/", requireAuth, requireRole("Root"), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const notification = await prisma.notification.create({
    data: { title: parsed.data.title, message: parsed.data.message, targetRoles: parsed.data.targetRoles, createdById: req.user!.id },
  });

  res.status(201).json({ notification });
});

router.patch("/:id/read", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId: id, userId } },
    create: { notificationId: id, userId },
    update: {},
  });

  res.json({ ok: true });
});

export default router;

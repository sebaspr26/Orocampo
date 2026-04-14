import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireRole("Root"), async (_req: AuthRequest, res: Response): Promise<void> => {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
  res.json({ roles });
});

export default router;

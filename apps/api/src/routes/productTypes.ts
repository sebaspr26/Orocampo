import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  minStockKg: z.number().positive().optional(),
});

router.get("/", requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const types = await prisma.productType.findMany({ orderBy: { name: "asc" } });
  res.json({ productTypes: types });
});

router.post("/", requireAuth, requireRole("Administrador", "Secretaria"), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const existing = await prisma.productType.findUnique({ where: { name: parsed.data.name } });
  if (existing) { res.status(409).json({ error: "Ya existe un tipo con ese nombre" }); return; }

  const productType = await prisma.productType.create({ data: parsed.data as { name: string; description?: string; minStockKg?: number } });
  res.status(201).json({ productType });
});

router.put("/:id", requireAuth, requireRole("Administrador", "Secretaria"), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const productType = await prisma.productType.update({ where: { id: req.params.id as string }, data: parsed.data });
  res.json({ productType });
});

export default router;

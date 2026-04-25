import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

const EXPIRY_ALERT_DAYS = 7;

// GET /inventory/summary — total per cheese type (for dashboard)
router.get("/summary", requireAuth, requireRole("Administrador", "Secretaria"), async (_req: AuthRequest, res: Response): Promise<void> => {
  const types = await prisma.productType.findMany({
    include: {
      entries: {
        where: { remainingKg: { gt: 0 } },
        select: { remainingKg: true, expiryDate: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const alertThreshold = new Date(now.getTime() + EXPIRY_ALERT_DAYS * 24 * 60 * 60 * 1000);

  const summary = types.map((t) => {
    const totalKg = t.entries.reduce((sum, e) => sum + e.remainingKg, 0);
    const expiringCount = t.entries.filter(
      (e) => new Date(e.expiryDate) <= alertThreshold && e.remainingKg > 0
    ).length;
    return {
      id: t.id,
      name: t.name,
      minStockKg: t.minStockKg,
      totalKg,
      lowStock: totalKg < t.minStockKg,
      expiringCount,
    };
  });

  res.json({ summary });
});

// GET /inventory/alerts
router.get("/alerts", requireAuth, requireRole("Administrador", "Secretaria"), async (_req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const alertThreshold = new Date(now.getTime() + EXPIRY_ALERT_DAYS * 24 * 60 * 60 * 1000);

  const types = await prisma.productType.findMany({
    include: {
      entries: {
        where: { remainingKg: { gt: 0 } },
        select: { id: true, batchNumber: true, remainingKg: true, expiryDate: true },
      },
    },
  });

  const lowStockAlerts = types
    .map((t) => {
      const totalKg = t.entries.reduce((sum, e) => sum + e.remainingKg, 0);
      return totalKg < t.minStockKg ? { type: "LOW_STOCK" as const, productName: t.name, totalKg, minStockKg: t.minStockKg } : null;
    })
    .filter(Boolean);

  const expiryAlerts = types.flatMap((t) =>
    t.entries
      .filter((e) => new Date(e.expiryDate) <= alertThreshold)
      .map((e) => ({
        type: "EXPIRY" as const,
        productName: t.name,
        batchNumber: e.batchNumber,
        remainingKg: e.remainingKg,
        expiryDate: e.expiryDate,
        daysLeft: Math.ceil((new Date(e.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }))
  );

  res.json({ alerts: [...lowStockAlerts, ...expiryAlerts] });
});

// GET /inventory/entries — list entries (history)
router.get("/entries", requireAuth, requireRole("Administrador", "Secretaria"), async (_req: AuthRequest, res: Response): Promise<void> => {
  const entries = await prisma.inventoryEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: { productType: { select: { id: true, name: true } } },
  });
  res.json({ entries });
});

// POST /inventory/entries — register new batch
const entrySchema = z.object({
  productTypeId: z.string(),
  batchNumber: z.string().min(1),
  entryDate: z.string().optional(),
  expiryDate: z.string(),
  quantityKg: z.number().positive(),
  purchasePrice: z.number().positive(),
  notes: z.string().optional(),
});

router.post("/entries", requireAuth, requireRole("Secretaria", "Administrador"), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = entrySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return; }

  const { productTypeId, batchNumber, entryDate, expiryDate, quantityKg, purchasePrice, notes } = parsed.data;

  const productType = await prisma.productType.findUnique({ where: { id: productTypeId } });
  if (!productType) { res.status(404).json({ error: "Tipo de producto no encontrado" }); return; }

  const entry = await prisma.inventoryEntry.create({
    data: {
      productTypeId,
      batchNumber,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      expiryDate: new Date(expiryDate),
      quantityKg,
      remainingKg: quantityKg,
      purchasePrice,
      notes,
      createdById: req.user!.id,
    },
    include: { productType: { select: { id: true, name: true } } },
  });

  // Register ENTRADA movement
  await prisma.stockMovement.create({
    data: {
      entryId: entry.id,
      type: "ENTRADA",
      quantityKg,
      reason: "Registro de lote nuevo",
      createdById: req.user!.id,
    },
  });

  res.status(201).json({ entry });
});

// GET /inventory/movements — movement history
router.get("/movements", requireAuth, requireRole("Administrador", "Secretaria"), async (_req: AuthRequest, res: Response): Promise<void> => {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      entry: {
        select: {
          batchNumber: true,
          productType: { select: { name: true } },
        },
      },
    },
    take: 100,
  });
  res.json({ movements });
});

// POST /inventory/movements — register manual entry/exit
const movementSchema = z.object({
  entryId: z.string(),
  type: z.enum(["ENTRADA", "SALIDA", "AJUSTE"]),
  quantityKg: z.number().positive(),
  reason: z.string().optional(),
});

router.post("/movements", requireAuth, requireRole("Secretaria", "Administrador"), async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = movementSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const { entryId, type, quantityKg, reason } = parsed.data;

  const entry = await prisma.inventoryEntry.findUnique({ where: { id: entryId } });
  if (!entry) { res.status(404).json({ error: "Lote no encontrado" }); return; }

  if (type === "SALIDA" && entry.remainingKg < quantityKg) {
    res.status(400).json({ error: `Stock insuficiente. Disponible: ${entry.remainingKg} kg` }); return;
  }

  const delta = type === "ENTRADA" ? quantityKg : -quantityKg;

  await prisma.$transaction([
    prisma.inventoryEntry.update({
      where: { id: entryId },
      data: { remainingKg: { increment: delta } },
    }),
    prisma.stockMovement.create({
      data: { entryId, type, quantityKg, reason, createdById: req.user!.id },
    }),
  ]);

  res.status(201).json({ success: true });
});

export default router;

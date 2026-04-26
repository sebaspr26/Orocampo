import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "orocampo-dev-secret-2024";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  platform: z.enum(["mobile", "web"]).optional(),
  deviceToken: z.string().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const { email, password, platform, deviceToken } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Usuario desactivado. Contacta al administrador." });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  // Restricción de sesión móvil única
  if (platform === "mobile" && deviceToken) {
    const existing = await prisma.mobileSession.findUnique({ where: { userId: user.id } });

    if (existing) {
      const inactive = Date.now() - existing.lastActivity.getTime() > SEVEN_DAYS;

      if (inactive) {
        // Sesión expirada por inactividad, permitir nuevo login
        await prisma.mobileSession.delete({ where: { id: existing.id } });
      } else if (existing.deviceToken !== deviceToken) {
        // Otro dispositivo activo
        res.status(409).json({
          error: "Ya hay una sesión activa en otro dispositivo. Contacta al administrador para cerrarla.",
          code: "DEVICE_CONFLICT",
        });
        return;
      }
      // Mismo dispositivo → actualizar
    }

    await prisma.mobileSession.upsert({
      where: { userId: user.id },
      update: { deviceToken, lastActivity: new Date() },
      create: { userId: user.id, deviceToken },
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name ?? "sin_rol",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name ?? "sin_rol",
      isActive: user.isActive,
    },
  });
});

// POST /auth/logout — eliminar sesión móvil
router.post("/logout", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.mobileSession.deleteMany({ where: { userId: req.user!.id } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "El correo ya está registrado" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  res.status(201).json({ message: "Usuario creado exitosamente", userId: user.id });
});

router.get("/me", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, isActive: true, role: { select: { name: true } } },
    });

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ user: { ...user, role: user.role?.name ?? "sin_rol" } });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

interface AuthPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default router;

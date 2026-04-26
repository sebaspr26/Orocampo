import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET ?? "orocampo-dev-secret-2024";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export interface AuthPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;

    // Si viene de mobile, validar sesión del dispositivo
    const deviceToken = req.headers["x-device-token"] as string | undefined;
    if (deviceToken) {
      prisma.mobileSession.findUnique({ where: { userId: payload.id } }).then((session) => {
        if (!session || session.deviceToken !== deviceToken) {
          res.status(401).json({ error: "Sesión móvil cerrada. Vuelve a iniciar sesión.", code: "SESSION_REVOKED" });
          return;
        }

        const inactive = Date.now() - session.lastActivity.getTime() > SEVEN_DAYS;
        if (inactive) {
          prisma.mobileSession.delete({ where: { id: session.id } }).catch(() => {});
          res.status(401).json({ error: "Sesión expirada por inactividad.", code: "SESSION_EXPIRED" });
          return;
        }

        // Actualizar lastActivity (fire and forget)
        prisma.mobileSession.update({
          where: { id: session.id },
          data: { lastActivity: new Date() },
        }).catch(() => {});

        next();
      }).catch(() => {
        res.status(500).json({ error: "Error validando sesión" });
      });
      return;
    }

    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Acceso denegado: permisos insuficientes" });
      return;
    }
    next();
  };
}

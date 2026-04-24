import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Root" },
      update: {},
      create: { name: "Root", description: "Super administrador — gestión de usuarios y roles" },
    }),
    prisma.role.upsert({
      where: { name: "Administrador" },
      update: {},
      create: { name: "Administrador", description: "Gestión operativa del sistema" },
    }),
    prisma.role.upsert({
      where: { name: "Secretaria" },
      update: {},
      create: { name: "Secretaria", description: "Gestión de pedidos y clientes" },
    }),
    prisma.role.upsert({
      where: { name: "Domiciliario" },
      update: {},
      create: { name: "Domiciliario", description: "Entrega de pedidos" },
    }),
  ]);

  const [rootRole, adminRole, secretariaRole, domiciliarioRole] = roles;

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "root@orocampo.com" },
      update: {},
      create: { name: "Root", email: "root@orocampo.com", password: await bcrypt.hash("root123", 12), roleId: rootRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "julian@orocampo.com" },
      update: {},
      create: { name: "Julian", email: "julian@orocampo.com", password: await bcrypt.hash("julian123", 12), roleId: adminRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "secretaria@orocampo.com" },
      update: {},
      create: { name: "Secretaria", email: "secretaria@orocampo.com", password: await bcrypt.hash("secretaria123", 12), roleId: secretariaRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "domiciliario@orocampo.com" },
      update: {},
      create: { name: "Domiciliario", email: "domiciliario@orocampo.com", password: await bcrypt.hash("domiciliario123", 12), roleId: domiciliarioRole.id, isActive: true },
    }),
  ]);

  console.log("Roles creados:", roles.map((r) => r.name).join(", "));
  console.log("Usuarios creados:", users.map((u) => u.email).join(", "));

  // Seed default cheese types
  await Promise.all([
    prisma.productType.upsert({
      where: { name: "Queso Blanco" },
      update: {},
      create: { name: "Queso Blanco", description: "Queso blanco fresco", minStockKg: 50 },
    }),
    prisma.productType.upsert({
      where: { name: "Queso Doble Crema" },
      update: {},
      create: { name: "Queso Doble Crema", description: "Queso doble crema", minStockKg: 50 },
    }),
    prisma.productType.upsert({
      where: { name: "Queso Costeño" },
      update: {},
      create: { name: "Queso Costeño", description: "Queso costeño salado", minStockKg: 30 },
    }),
  ]);
  console.log("Tipos de queso creados");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

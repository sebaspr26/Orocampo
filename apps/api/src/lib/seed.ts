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

  const rootRole = roles[0];
  const password = await bcrypt.hash("root123", 12);

  const root = await prisma.user.upsert({
    where: { email: "root@orocampo.com" },
    update: {},
    create: {
      name: "Root",
      email: "root@orocampo.com",
      password,
      roleId: rootRole.id,
      isActive: true,
    },
  });

  console.log("Roles creados:", roles.map((r) => r.name).join(", "));
  console.log("Root creado:", root.email);

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

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Roles ──────────────────────────────────────────────────────────────────
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

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "root@orocampo.com" },
      update: {},
      create: { name: "Root", email: "root@orocampo.com", password: await bcrypt.hash("root123", 12), roleId: rootRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "julian@orocampo.com" },
      update: {},
      create: { name: "Julián Mora", email: "julian@orocampo.com", password: await bcrypt.hash("julian123", 12), roleId: adminRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "secretaria@orocampo.com" },
      update: {},
      create: { name: "Laura Ríos", email: "secretaria@orocampo.com", password: await bcrypt.hash("secretaria123", 12), roleId: secretariaRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "domiciliario@orocampo.com" },
      update: {},
      create: { name: "Carlos Pineda", email: "domiciliario@orocampo.com", password: await bcrypt.hash("domiciliario123", 12), roleId: domiciliarioRole.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "domiciliario2@orocampo.com" },
      update: {},
      create: { name: "Andrés Gómez", email: "domiciliario2@orocampo.com", password: await bcrypt.hash("domiciliario123", 12), roleId: domiciliarioRole.id, isActive: true },
    }),
  ]);

  const [, admin, secretaria] = users;
  console.log("Roles:", roles.map((r) => r.name).join(", "));
  console.log("Usuarios:", users.map((u) => u.email).join(", "));

  // ── Tipos de producto ──────────────────────────────────────────────────────
  const [ptBlanco, ptDobleCrema, ptCosteno, ptCampesino, ptSuero] = await Promise.all([
    prisma.productType.upsert({
      where: { name: "Queso Blanco" },
      update: {},
      create: { name: "Queso Blanco", description: "Queso blanco fresco", minStockKg: 50 },
    }),
    prisma.productType.upsert({
      where: { name: "Queso Doble Crema" },
      update: {},
      create: { name: "Queso Doble Crema", description: "Queso doble crema suave", minStockKg: 50 },
    }),
    prisma.productType.upsert({
      where: { name: "Queso Costeño" },
      update: {},
      create: { name: "Queso Costeño", description: "Queso costeño salado", minStockKg: 30 },
    }),
    prisma.productType.upsert({
      where: { name: "Queso Campesino" },
      update: {},
      create: { name: "Queso Campesino", description: "Queso campesino artesanal", minStockKg: 20 },
    }),
    prisma.productType.upsert({
      where: { name: "Suero Costeño" },
      update: {},
      create: { name: "Suero Costeño", description: "Suero costeño artesanal", minStockKg: 15 },
    }),
  ]);
  console.log("Tipos de producto creados");

  // ── Clientes ───────────────────────────────────────────────────────────────
  const clientesExistentes = await prisma.cliente.count();
  let clientes;

  if (clientesExistentes === 0) {
    clientes = await Promise.all([
      prisma.cliente.create({ data: { nombre: "Restaurante El Buen Sabor", telefono: "3101234567", email: "buensabor@gmail.com", direccion: "Calle 15 #8-42, Centro", notas: "Pedido semanal los martes" } }),
      prisma.cliente.create({ data: { nombre: "Tienda Don Jorge", telefono: "3207654321", direccion: "Carrera 5 #12-10, Barrio Nuevo", notas: "Paga de contado siempre" } }),
      prisma.cliente.create({ data: { nombre: "Supermercado La Cosecha", telefono: "3154567890", email: "lacosecha@comercio.co", direccion: "Av. Principal #30-50", notas: "Crédito a 15 días" } }),
      prisma.cliente.create({ data: { nombre: "María González", telefono: "3119876543", direccion: "Manzana 4 Casa 7, Urb. El Prado" } }),
      prisma.cliente.create({ data: { nombre: "Restaurante Las Delicias", telefono: "3183456789", email: "lasdelicias@rest.co", direccion: "Calle 23 #5-18" } }),
      prisma.cliente.create({ data: { nombre: "Hotel Campestre San Luis", telefono: "3145678901", email: "info@hotelcampestre.co", direccion: "Km 3 vía al campo", notas: "Factura a nombre del hotel, NIT 900123456-1" } }),
      prisma.cliente.create({ data: { nombre: "Cafetería Central", telefono: "3162345678", direccion: "Plaza principal local 8" } }),
      prisma.cliente.create({ data: { nombre: "Panadería La Estrella", telefono: "3178901234", email: "laestrella@pan.co", direccion: "Calle 7 #3-22", notas: "Queso para pandebono y almojábanas" } }),
      prisma.cliente.create({ data: { nombre: "Carlos Pérez", telefono: "3191234567", direccion: "Barrio Las Flores, casa 45" } }),
      prisma.cliente.create({ data: { nombre: "Distribuidora Lácteos del Sur", telefono: "3204567890", email: "ventas@lacteossur.co", direccion: "Zona industrial bodega 12", notas: "Distribuidor mayorista — crédito 30 días" } }),
    ]);
    console.log("Clientes creados:", clientes.length);
  } else {
    clientes = await prisma.cliente.findMany({ take: 10 });
    console.log("Clientes ya existían, usando los existentes");
  }

  const [restBuenSabor, tiendaJorge, superCosecha, mariaG, restDelicias, hotelCampestre, cafeteria, panaderia, carlosP, distribuidora] = clientes;

  // ── Inventario ─────────────────────────────────────────────────────────────
  const inventarioExistente = await prisma.inventoryEntry.count();
  let lotes: any[] = [];

  if (inventarioExistente === 0) {
    const lotesDef = [
      // Enero 2026
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-001", entryDate: new Date("2026-01-10"), expiryDate: new Date("2026-02-10"), quantityKg: 200, remainingKg: 0, purchasePrice: 8500, notes: "Proveedor finca El Rancho" },
      { productTypeId: ptDobleCrema.id, batchNumber: "L-2026-002", entryDate: new Date("2026-01-15"), expiryDate: new Date("2026-02-15"), quantityKg: 150, remainingKg: 0, purchasePrice: 11000, notes: "Proveedor Lácteos Andinos" },
      // Febrero 2026
      { productTypeId: ptCosteno.id, batchNumber: "L-2026-003", entryDate: new Date("2026-02-05"), expiryDate: new Date("2026-03-05"), quantityKg: 100, remainingKg: 0, purchasePrice: 9000 },
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-004", entryDate: new Date("2026-02-20"), expiryDate: new Date("2026-03-20"), quantityKg: 250, remainingKg: 0, purchasePrice: 8500 },
      { productTypeId: ptCampesino.id, batchNumber: "L-2026-005", entryDate: new Date("2026-02-25"), expiryDate: new Date("2026-03-25"), quantityKg: 80, remainingKg: 0, purchasePrice: 10500 },
      // Marzo 2026
      { productTypeId: ptDobleCrema.id, batchNumber: "L-2026-006", entryDate: new Date("2026-03-08"), expiryDate: new Date("2026-04-08"), quantityKg: 180, remainingKg: 0, purchasePrice: 11000 },
      { productTypeId: ptSuero.id, batchNumber: "L-2026-007", entryDate: new Date("2026-03-15"), expiryDate: new Date("2026-04-05"), quantityKg: 60, remainingKg: 0, purchasePrice: 6500 },
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-008", entryDate: new Date("2026-03-22"), expiryDate: new Date("2026-04-22"), quantityKg: 300, remainingKg: 0, purchasePrice: 8500, notes: "Lote grande para semana santa" },
      // Abril 2026 — stock actual
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-009", entryDate: new Date("2026-04-05"), expiryDate: new Date("2026-05-05"), quantityKg: 220, remainingKg: 85, purchasePrice: 8800 },
      { productTypeId: ptDobleCrema.id, batchNumber: "L-2026-010", entryDate: new Date("2026-04-10"), expiryDate: new Date("2026-05-10"), quantityKg: 160, remainingKg: 62, purchasePrice: 11500 },
      { productTypeId: ptCosteno.id, batchNumber: "L-2026-011", entryDate: new Date("2026-04-12"), expiryDate: new Date("2026-05-12"), quantityKg: 90, remainingKg: 41, purchasePrice: 9200 },
      { productTypeId: ptCampesino.id, batchNumber: "L-2026-012", entryDate: new Date("2026-04-18"), expiryDate: new Date("2026-05-18"), quantityKg: 70, remainingKg: 55, purchasePrice: 10800 },
      { productTypeId: ptSuero.id, batchNumber: "L-2026-013", entryDate: new Date("2026-04-20"), expiryDate: new Date("2026-05-10"), quantityKg: 50, remainingKg: 38, purchasePrice: 6800 },
    ];

    for (const def of lotesDef) {
      const lote = await prisma.inventoryEntry.create({
        data: { ...def, createdById: admin.id },
      });
      lotes.push(lote);
      // Movimiento de entrada
      await prisma.stockMovement.create({
        data: { entryId: lote.id, type: "ENTRADA", quantityKg: lote.quantityKg, reason: "Compra de proveedor", createdById: admin.id, createdAt: lote.entryDate },
      });
    }
    console.log("Inventario creado:", lotes.length, "lotes");
  } else {
    lotes = await prisma.inventoryEntry.findMany();
    console.log("Inventario ya existía");
  }

  // ── Ventas ─────────────────────────────────────────────────────────────────
  const ventasExistentes = await prisma.venta.count();
  if (ventasExistentes > 0) {
    console.log("Ventas ya existían, saltando...");
    return;
  }

  // Helper para crear venta completa
  async function crearVenta(data: {
    clienteId: string;
    fecha: Date;
    metodoPago: string;
    estado: string;
    notas?: string;
    createdById: string;
    items: { productTypeId: string; cantidadKg: number; precioUnitario: number }[];
    pagoMonto?: number;
    pagoMetodo?: string;
  }) {
    const total = data.items.reduce((sum, i) => sum + i.cantidadKg * i.precioUnitario, 0);
    const venta = await prisma.venta.create({
      data: {
        clienteId: data.clienteId,
        fecha: data.fecha,
        metodoPago: data.metodoPago,
        estado: data.estado,
        total,
        notas: data.notas,
        createdById: data.createdById,
        items: {
          create: data.items.map((i) => ({
            productTypeId: i.productTypeId,
            cantidadKg: i.cantidadKg,
            precioUnitario: i.precioUnitario,
            subtotal: i.cantidadKg * i.precioUnitario,
          })),
        },
      },
    });

    if (data.pagoMonto) {
      await prisma.pago.create({
        data: {
          clienteId: data.clienteId,
          ventaId: venta.id,
          monto: data.pagoMonto,
          metodoPago: data.pagoMetodo ?? data.metodoPago,
          fecha: data.fecha,
          createdById: data.createdById,
        },
      });
    }

    // Movimientos de salida en inventario (usamos el lote más reciente de cada tipo)
    for (const item of data.items) {
      const lote = lotes.find((l) => l.productTypeId === item.productTypeId);
      if (lote) {
        await prisma.stockMovement.create({
          data: { entryId: lote.id, type: "SALIDA", quantityKg: item.cantidadKg, reason: `Venta #${venta.id.slice(-6)}`, createdById: data.createdById, createdAt: data.fecha },
        });
      }
    }

    return venta;
  }

  // Enero
  await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-01-13"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 25, precioUnitario: 14000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 10, precioUnitario: 18000 }], pagoMonto: 530000, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: tiendaJorge.id, fecha: new Date("2026-01-16"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 15, precioUnitario: 13500 }], pagoMonto: 202500, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: superCosecha.id, fecha: new Date("2026-01-20"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: admin.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 40, precioUnitario: 13000 }, { productTypeId: ptCosteno.id, cantidadKg: 20, precioUnitario: 15000 }], pagoMonto: 820000, pagoMetodo: "TRANSFERENCIA" });
  await crearVenta({ clienteId: distribuidora.id, fecha: new Date("2026-01-25"), metodoPago: "CREDITO", estado: "PAGADA", createdById: admin.id, notas: "Despacho a bodega principal", items: [{ productTypeId: ptBlanco.id, cantidadKg: 60, precioUnitario: 12500 }, { productTypeId: ptDobleCrema.id, cantidadKg: 40, precioUnitario: 17000 }], pagoMonto: 1430000, pagoMetodo: "TRANSFERENCIA" });

  // Febrero
  await crearVenta({ clienteId: panaderia.id, fecha: new Date("2026-02-03"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 20, precioUnitario: 14000 }, { productTypeId: ptCampesino.id, cantidadKg: 8, precioUnitario: 17000 }], pagoMonto: 416000, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: restDelicias.id, fecha: new Date("2026-02-10"), metodoPago: "NEQUI", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 15, precioUnitario: 18500 }, { productTypeId: ptBlanco.id, cantidadKg: 10, precioUnitario: 14000 }], pagoMonto: 417500, pagoMetodo: "NEQUI" });
  await crearVenta({ clienteId: mariaG.id, fecha: new Date("2026-02-14"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 5, precioUnitario: 15000 }], pagoMonto: 75000, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: hotelCampestre.id, fecha: new Date("2026-02-20"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: admin.id, notas: "Pedido para evento de temporada", items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 30, precioUnitario: 18000 }, { productTypeId: ptCampesino.id, cantidadKg: 15, precioUnitario: 17000 }, { productTypeId: ptCosteno.id, cantidadKg: 10, precioUnitario: 15500 }], pagoMonto: 952500, pagoMetodo: "TRANSFERENCIA" });
  await crearVenta({ clienteId: cafeteria.id, fecha: new Date("2026-02-27"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 12, precioUnitario: 14000 }], pagoMonto: 168000, pagoMetodo: "EFECTIVO" });

  // Marzo
  await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-03-04"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 28, precioUnitario: 14000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 12, precioUnitario: 18000 }], pagoMonto: 608000, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: distribuidora.id, fecha: new Date("2026-03-10"), metodoPago: "CREDITO", estado: "PAGADA", createdById: admin.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 80, precioUnitario: 12500 }, { productTypeId: ptDobleCrema.id, cantidadKg: 50, precioUnitario: 17000 }], pagoMonto: 1850000, pagoMetodo: "TRANSFERENCIA" });
  await crearVenta({ clienteId: superCosecha.id, fecha: new Date("2026-03-18"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: admin.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 35, precioUnitario: 13500 }, { productTypeId: ptCosteno.id, cantidadKg: 18, precioUnitario: 15500 }, { productTypeId: ptSuero.id, cantidadKg: 10, precioUnitario: 11000 }], pagoMonto: 1064500, pagoMetodo: "TRANSFERENCIA" });
  await crearVenta({ clienteId: carlosP.id, fecha: new Date("2026-03-22"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 3, precioUnitario: 15000 }, { productTypeId: ptCampesino.id, cantidadKg: 2, precioUnitario: 17500 }], pagoMonto: 80000, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: panaderia.id, fecha: new Date("2026-03-29"), metodoPago: "NEQUI", estado: "PAGADA", createdById: secretaria.id, notas: "Pedido extra semana santa", items: [{ productTypeId: ptBlanco.id, cantidadKg: 30, precioUnitario: 14000 }, { productTypeId: ptCampesino.id, cantidadKg: 12, precioUnitario: 17000 }], pagoMonto: 624000, pagoMetodo: "NEQUI" });

  // Abril — algunas pendientes
  await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-04-08"), metodoPago: "CREDITO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 25, precioUnitario: 14500 }, { productTypeId: ptDobleCrema.id, cantidadKg: 10, precioUnitario: 18500 }], pagoMonto: 547500, pagoMetodo: "TRANSFERENCIA" });
  await crearVenta({ clienteId: hotelCampestre.id, fecha: new Date("2026-04-14"), metodoPago: "TRANSFERENCIA", estado: "PENDIENTE", createdById: admin.id, notas: "Pedido quincenal", items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 20, precioUnitario: 18500 }, { productTypeId: ptCampesino.id, cantidadKg: 10, precioUnitario: 17500 }] });
  await crearVenta({ clienteId: tiendaJorge.id, fecha: new Date("2026-04-17"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 18, precioUnitario: 14500 }], pagoMonto: 261000, pagoMetodo: "EFECTIVO" });
  await crearVenta({ clienteId: distribuidora.id, fecha: new Date("2026-04-20"), metodoPago: "CREDITO", estado: "PENDIENTE", createdById: admin.id, notas: "Pedido mensual — pendiente transferencia", items: [{ productTypeId: ptBlanco.id, cantidadKg: 70, precioUnitario: 13000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 40, precioUnitario: 17500 }, { productTypeId: ptCosteno.id, cantidadKg: 20, precioUnitario: 15500 }] });
  await crearVenta({ clienteId: cafeteria.id, fecha: new Date("2026-04-22"), metodoPago: "NEQUI", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 10, precioUnitario: 14500 }, { productTypeId: ptSuero.id, cantidadKg: 5, precioUnitario: 11000 }], pagoMonto: 200000, pagoMetodo: "NEQUI" });
  await crearVenta({ clienteId: mariaG.id, fecha: new Date("2026-04-23"), metodoPago: "EFECTIVO", estado: "PENDIENTE", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 4, precioUnitario: 15000 }] });

  console.log("Ventas y pagos creados");

  // ── Notificaciones de prueba ───────────────────────────────────────────────
  const notifsExistentes = await prisma.notification.count();
  if (notifsExistentes === 0) {
    await Promise.all([
      prisma.notification.create({ data: { title: "Stock bajo: Queso Costeño", message: "El lote L-2026-011 de Queso Costeño tiene menos de 50 kg disponibles.", targetRoles: ["Root", "Administrador"], createdById: admin.id, createdAt: new Date("2026-04-22") } }),
      prisma.notification.create({ data: { title: "Pedido pendiente de pago", message: "Distribuidora Lácteos del Sur tiene un pedido de $1.8M pendiente de transferencia.", targetRoles: ["Root", "Administrador", "Secretaria"], createdById: admin.id, createdAt: new Date("2026-04-21") } }),
      prisma.notification.create({ data: { title: "Nuevo lote ingresado", message: "Se registró el lote L-2026-013 de Suero Costeño: 50 kg.", targetRoles: ["Root", "Administrador"], createdById: admin.id, createdAt: new Date("2026-04-20") } }),
    ]);
    console.log("Notificaciones creadas");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

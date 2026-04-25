import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Roles ──────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: "Root" }, update: {}, create: { name: "Root", description: "Super administrador — gestión de usuarios y roles" } }),
    prisma.role.upsert({ where: { name: "Administrador" }, update: {}, create: { name: "Administrador", description: "Gestión operativa del sistema" } }),
    prisma.role.upsert({ where: { name: "Secretaria" }, update: {}, create: { name: "Secretaria", description: "Gestión de pedidos y clientes" } }),
    prisma.role.upsert({ where: { name: "Domiciliario" }, update: {}, create: { name: "Domiciliario", description: "Entrega de pedidos" } }),
  ]);
  const [rootRole, adminRole, secretariaRole, domiciliarioRole] = roles;
  console.log("Roles:", roles.map((r) => r.name).join(", "));

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "root@orocampo.com" }, update: {}, create: { name: "Root", email: "root@orocampo.com", password: await bcrypt.hash("root123", 12), roleId: rootRole.id, isActive: true } }),
    prisma.user.upsert({ where: { email: "julian@orocampo.com" }, update: {}, create: { name: "Julián Mora", email: "julian@orocampo.com", password: await bcrypt.hash("julian123", 12), roleId: adminRole.id, isActive: true } }),
    prisma.user.upsert({ where: { email: "secretaria@orocampo.com" }, update: {}, create: { name: "Laura Ríos", email: "secretaria@orocampo.com", password: await bcrypt.hash("secretaria123", 12), roleId: secretariaRole.id, isActive: true } }),
    prisma.user.upsert({ where: { email: "domiciliario@orocampo.com" }, update: {}, create: { name: "Carlos Pineda", email: "domiciliario@orocampo.com", password: await bcrypt.hash("domiciliario123", 12), roleId: domiciliarioRole.id, isActive: true } }),
    prisma.user.upsert({ where: { email: "domiciliario2@orocampo.com" }, update: {}, create: { name: "Andrés Gómez", email: "domiciliario2@orocampo.com", password: await bcrypt.hash("domiciliario123", 12), roleId: domiciliarioRole.id, isActive: true } }),
  ]);
  const [, admin, secretaria, domiciliario1, domiciliario2] = users;
  console.log("Usuarios:", users.map((u) => u.email).join(", "));

  // ── Tipos de producto ──────────────────────────────────────────────────────
  const [ptBlanco, ptDobleCrema, ptCosteno, ptCampesino, ptSuero] = await Promise.all([
    prisma.productType.upsert({ where: { name: "Queso Blanco" }, update: {}, create: { name: "Queso Blanco", description: "Queso blanco fresco", minStockKg: 50 } }),
    prisma.productType.upsert({ where: { name: "Queso Doble Crema" }, update: {}, create: { name: "Queso Doble Crema", description: "Queso doble crema suave", minStockKg: 50 } }),
    prisma.productType.upsert({ where: { name: "Queso Costeño" }, update: {}, create: { name: "Queso Costeño", description: "Queso costeño salado", minStockKg: 30 } }),
    prisma.productType.upsert({ where: { name: "Queso Campesino" }, update: {}, create: { name: "Queso Campesino", description: "Queso campesino artesanal", minStockKg: 20 } }),
    prisma.productType.upsert({ where: { name: "Suero Costeño" }, update: {}, create: { name: "Suero Costeño", description: "Suero costeño artesanal", minStockKg: 15 } }),
  ]);
  console.log("Tipos de producto listos");

  // ── Tipos de cliente ───────────────────────────────────────────────────────
  const [tipoMayorista, tipoRestaurante, tipoMinorista] = await Promise.all([
    prisma.tipoCliente.upsert({
      where: { nombre: "Mayorista" },
      update: {},
      create: { nombre: "Mayorista", descripcion: "Distribuidores y supermercados — volumen alto, precio preferencial" },
    }),
    prisma.tipoCliente.upsert({
      where: { nombre: "Restaurante" },
      update: {},
      create: { nombre: "Restaurante", descripcion: "Restaurantes, hoteles y establecimientos gastronómicos" },
    }),
    prisma.tipoCliente.upsert({
      where: { nombre: "Minorista" },
      update: {},
      create: { nombre: "Minorista", descripcion: "Tiendas de barrio, panaderías y clientes particulares" },
    }),
  ]);

  // Precios por tipo — upsert para reejecutar sin duplicar
  const preciosTipoData = [
    // Mayorista
    { tipoClienteId: tipoMayorista.id, productTypeId: ptBlanco.id, precio: 12500 },
    { tipoClienteId: tipoMayorista.id, productTypeId: ptDobleCrema.id, precio: 16500 },
    { tipoClienteId: tipoMayorista.id, productTypeId: ptCosteno.id, precio: 14000 },
    { tipoClienteId: tipoMayorista.id, productTypeId: ptCampesino.id, precio: 15500 },
    { tipoClienteId: tipoMayorista.id, productTypeId: ptSuero.id, precio: 9500 },
    // Restaurante
    { tipoClienteId: tipoRestaurante.id, productTypeId: ptBlanco.id, precio: 14000 },
    { tipoClienteId: tipoRestaurante.id, productTypeId: ptDobleCrema.id, precio: 18000 },
    { tipoClienteId: tipoRestaurante.id, productTypeId: ptCosteno.id, precio: 15500 },
    { tipoClienteId: tipoRestaurante.id, productTypeId: ptCampesino.id, precio: 17000 },
    { tipoClienteId: tipoRestaurante.id, productTypeId: ptSuero.id, precio: 11000 },
    // Minorista
    { tipoClienteId: tipoMinorista.id, productTypeId: ptBlanco.id, precio: 15000 },
    { tipoClienteId: tipoMinorista.id, productTypeId: ptDobleCrema.id, precio: 19500 },
    { tipoClienteId: tipoMinorista.id, productTypeId: ptCosteno.id, precio: 16500 },
    { tipoClienteId: tipoMinorista.id, productTypeId: ptCampesino.id, precio: 18000 },
    { tipoClienteId: tipoMinorista.id, productTypeId: ptSuero.id, precio: 12000 },
  ];
  await Promise.all(
    preciosTipoData.map(d =>
      prisma.precioTipo.upsert({
        where: { tipoClienteId_productTypeId: { tipoClienteId: d.tipoClienteId, productTypeId: d.productTypeId } },
        update: { precio: d.precio },
        create: { ...d, createdById: admin.id },
      })
    )
  );
  console.log("Tipos de cliente y precios listos");

  // ── Cliente Mostrador (consumidor final) ───────────────────────────────────
  const mostradorExistente = await prisma.cliente.findFirst({ where: { esMostrador: true } });
  if (!mostradorExistente) {
    await prisma.cliente.create({ data: { nombre: "Mostrador", esMostrador: true } });
    console.log("Cliente Mostrador creado");
  }

  // ── Clientes ───────────────────────────────────────────────────────────────
  const clientesExistentes = await prisma.cliente.count();
  let clientes;

  if (clientesExistentes === 0) {
    clientes = await Promise.all([
      prisma.cliente.create({ data: { nombre: "Restaurante El Buen Sabor", telefono: "3101234567", email: "buensabor@gmail.com", direccion: "Calle 15 #8-42, Centro", notas: "Pedido semanal los martes", tipoClienteId: tipoRestaurante.id } }),
      prisma.cliente.create({ data: { nombre: "Tienda Don Jorge", telefono: "3207654321", direccion: "Carrera 5 #12-10, Barrio Nuevo", notas: "Paga de contado siempre", tipoClienteId: tipoMinorista.id } }),
      prisma.cliente.create({ data: { nombre: "Supermercado La Cosecha", telefono: "3154567890", email: "lacosecha@comercio.co", direccion: "Av. Principal #30-50", notas: "Crédito a 15 días", tipoClienteId: tipoMayorista.id } }),
      prisma.cliente.create({ data: { nombre: "María González", telefono: "3119876543", direccion: "Manzana 4 Casa 7, Urb. El Prado", tipoClienteId: tipoMinorista.id } }),
      prisma.cliente.create({ data: { nombre: "Restaurante Las Delicias", telefono: "3183456789", email: "lasdelicias@rest.co", direccion: "Calle 23 #5-18", tipoClienteId: tipoRestaurante.id } }),
      prisma.cliente.create({ data: { nombre: "Hotel Campestre San Luis", telefono: "3145678901", email: "info@hotelcampestre.co", direccion: "Km 3 vía al campo", notas: "Factura a nombre del hotel, NIT 900123456-1", tipoClienteId: tipoRestaurante.id } }),
      prisma.cliente.create({ data: { nombre: "Cafetería Central", telefono: "3162345678", direccion: "Plaza principal local 8", tipoClienteId: tipoMinorista.id } }),
      prisma.cliente.create({ data: { nombre: "Panadería La Estrella", telefono: "3178901234", email: "laestrella@pan.co", direccion: "Calle 7 #3-22", notas: "Queso para pandebono y almojábanas", tipoClienteId: tipoMinorista.id } }),
      prisma.cliente.create({ data: { nombre: "Carlos Pérez", telefono: "3191234567", direccion: "Barrio Las Flores, casa 45", tipoClienteId: tipoMinorista.id } }),
      prisma.cliente.create({ data: { nombre: "Distribuidora Lácteos del Sur", telefono: "3204567890", email: "ventas@lacteossur.co", direccion: "Zona industrial bodega 12", notas: "Distribuidor mayorista — crédito 30 días", tipoClienteId: tipoMayorista.id } }),
    ]);
    console.log("Clientes creados:", clientes.length);
  } else {
    clientes = await prisma.cliente.findMany({
      take: 10,
      orderBy: { createdAt: "asc" },
    });
    // Asignar tipos a clientes existentes si no los tienen
    const asignaciones = [
      { idx: 0, tipoId: tipoRestaurante.id },
      { idx: 1, tipoId: tipoMinorista.id },
      { idx: 2, tipoId: tipoMayorista.id },
      { idx: 3, tipoId: tipoMinorista.id },
      { idx: 4, tipoId: tipoRestaurante.id },
      { idx: 5, tipoId: tipoRestaurante.id },
      { idx: 6, tipoId: tipoMinorista.id },
      { idx: 7, tipoId: tipoMinorista.id },
      { idx: 8, tipoId: tipoMinorista.id },
      { idx: 9, tipoId: tipoMayorista.id },
    ];
    await Promise.all(
      asignaciones
        .filter(a => clientes[a.idx] && !clientes[a.idx].tipoClienteId)
        .map(a => prisma.cliente.update({ where: { id: clientes[a.idx].id }, data: { tipoClienteId: a.tipoId } }))
    );
    console.log("Clientes ya existían — tipos asignados");
  }

  const [restBuenSabor, tiendaJorge, superCosecha, mariaG, restDelicias, hotelCampestre, cafeteria, panaderia, carlosP, distribuidora] = clientes;

  // ── Precios individuales (overrides sobre tipo) ────────────────────────────
  const preciosClienteExistentes = await prisma.precioCliente.count();
  if (preciosClienteExistentes === 0) {
    const preciosIndiv = [
      // Hotel Campestre: precio especial negociado en Queso Doble Crema
      { clienteId: hotelCampestre.id, productTypeId: ptDobleCrema.id, precio: 18500 },
      // Distribuidora: precio negociado más bajo en Queso Blanco (volumen muy alto)
      { clienteId: distribuidora.id, productTypeId: ptBlanco.id, precio: 12000 },
      { clienteId: distribuidora.id, productTypeId: ptDobleCrema.id, precio: 16000 },
      // Supermercado La Cosecha: precio especial en Suero Costeño
      { clienteId: superCosecha.id, productTypeId: ptSuero.id, precio: 9000 },
      // Panadería: precio especial en Queso Campesino (compra fija semanal)
      { clienteId: panaderia.id, productTypeId: ptCampesino.id, precio: 17500 },
    ];
    await Promise.all(
      preciosIndiv.map(d =>
        prisma.precioCliente.upsert({
          where: { clienteId_productTypeId: { clienteId: d.clienteId, productTypeId: d.productTypeId } },
          update: { precio: d.precio },
          create: { ...d, vigente: true, createdById: admin.id },
        })
      )
    );
    console.log("Precios individuales creados");
  }

  // ── Inventario ─────────────────────────────────────────────────────────────
  const inventarioExistente = await prisma.inventoryEntry.count();
  let lotes: any[] = [];

  if (inventarioExistente === 0) {
    const lotesDef = [
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-001", entryDate: new Date("2026-01-10"), expiryDate: new Date("2026-02-10"), quantityKg: 200, remainingKg: 0, purchasePrice: 8500, notes: "Proveedor finca El Rancho" },
      { productTypeId: ptDobleCrema.id, batchNumber: "L-2026-002", entryDate: new Date("2026-01-15"), expiryDate: new Date("2026-02-15"), quantityKg: 150, remainingKg: 0, purchasePrice: 11000, notes: "Proveedor Lácteos Andinos" },
      { productTypeId: ptCosteno.id, batchNumber: "L-2026-003", entryDate: new Date("2026-02-05"), expiryDate: new Date("2026-03-05"), quantityKg: 100, remainingKg: 0, purchasePrice: 9000 },
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-004", entryDate: new Date("2026-02-20"), expiryDate: new Date("2026-03-20"), quantityKg: 250, remainingKg: 0, purchasePrice: 8500 },
      { productTypeId: ptCampesino.id, batchNumber: "L-2026-005", entryDate: new Date("2026-02-25"), expiryDate: new Date("2026-03-25"), quantityKg: 80, remainingKg: 0, purchasePrice: 10500 },
      { productTypeId: ptDobleCrema.id, batchNumber: "L-2026-006", entryDate: new Date("2026-03-08"), expiryDate: new Date("2026-04-08"), quantityKg: 180, remainingKg: 0, purchasePrice: 11000 },
      { productTypeId: ptSuero.id, batchNumber: "L-2026-007", entryDate: new Date("2026-03-15"), expiryDate: new Date("2026-04-05"), quantityKg: 60, remainingKg: 0, purchasePrice: 6500 },
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-008", entryDate: new Date("2026-03-22"), expiryDate: new Date("2026-04-22"), quantityKg: 300, remainingKg: 0, purchasePrice: 8500, notes: "Lote grande para semana santa" },
      { productTypeId: ptBlanco.id, batchNumber: "L-2026-009", entryDate: new Date("2026-04-05"), expiryDate: new Date("2026-05-05"), quantityKg: 220, remainingKg: 85, purchasePrice: 8800 },
      { productTypeId: ptDobleCrema.id, batchNumber: "L-2026-010", entryDate: new Date("2026-04-10"), expiryDate: new Date("2026-05-10"), quantityKg: 160, remainingKg: 62, purchasePrice: 11500 },
      { productTypeId: ptCosteno.id, batchNumber: "L-2026-011", entryDate: new Date("2026-04-12"), expiryDate: new Date("2026-05-12"), quantityKg: 90, remainingKg: 41, purchasePrice: 9200 },
      { productTypeId: ptCampesino.id, batchNumber: "L-2026-012", entryDate: new Date("2026-04-18"), expiryDate: new Date("2026-05-18"), quantityKg: 70, remainingKg: 55, purchasePrice: 10800 },
      { productTypeId: ptSuero.id, batchNumber: "L-2026-013", entryDate: new Date("2026-04-20"), expiryDate: new Date("2026-05-10"), quantityKg: 50, remainingKg: 38, purchasePrice: 6800 },
    ];
    for (const def of lotesDef) {
      const lote = await prisma.inventoryEntry.create({ data: { ...def, createdById: admin.id } });
      lotes.push(lote);
      await prisma.stockMovement.create({
        data: { entryId: lote.id, type: "ENTRADA", quantityKg: lote.quantityKg, reason: "Compra de proveedor", createdById: admin.id, createdAt: lote.entryDate },
      });
    }
    console.log("Inventario creado:", lotes.length, "lotes");
  } else {
    lotes = await prisma.inventoryEntry.findMany();
    console.log("Inventario ya existía");
  }

  // ── Rutas ──────────────────────────────────────────────────────────────────
  const rutasExistentes = await prisma.ruta.count();
  if (rutasExistentes === 0) {
    const [rutaNorte, rutaSur] = await Promise.all([
      prisma.ruta.create({
        data: {
          nombre: "Ruta Norte",
          domiciliarioId: domiciliario1.id,
          clientes: { connect: [{ id: tiendaJorge.id }, { id: mariaG.id }, { id: carlosP.id }, { id: panaderia.id }] },
        },
      }),
      prisma.ruta.create({
        data: {
          nombre: "Ruta Sur",
          domiciliarioId: domiciliario2.id,
          clientes: { connect: [{ id: restDelicias.id }, { id: cafeteria.id }, { id: restBuenSabor.id }] },
        },
      }),
    ]);
    console.log("Rutas creadas:", rutaNorte.nombre, rutaSur.nombre);
  } else {
    console.log("Rutas ya existían");
  }

  // ── Ventas ─────────────────────────────────────────────────────────────────
  const ventasExistentes = await prisma.venta.count();
  if (ventasExistentes > 0) {
    console.log("Ventas ya existían, saltando ventas...");
  } else {
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
          data: { clienteId: data.clienteId, ventaId: venta.id, monto: data.pagoMonto, metodoPago: data.pagoMetodo ?? data.metodoPago, fecha: data.fecha, createdById: data.createdById },
        });
      }
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

    // Enero — secretaria y admin
    await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-01-13"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 25, precioUnitario: 14000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 10, precioUnitario: 18000 }], pagoMonto: 530000 });
    await crearVenta({ clienteId: tiendaJorge.id, fecha: new Date("2026-01-16"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 15, precioUnitario: 13500 }], pagoMonto: 202500 });
    await crearVenta({ clienteId: superCosecha.id, fecha: new Date("2026-01-20"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: admin.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 40, precioUnitario: 13000 }, { productTypeId: ptCosteno.id, cantidadKg: 20, precioUnitario: 15000 }], pagoMonto: 820000 });
    await crearVenta({ clienteId: distribuidora.id, fecha: new Date("2026-01-25"), metodoPago: "CREDITO", estado: "PAGADA", createdById: admin.id, notas: "Despacho a bodega principal", items: [{ productTypeId: ptBlanco.id, cantidadKg: 60, precioUnitario: 12000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 40, precioUnitario: 16000 }], pagoMonto: 1360000, pagoMetodo: "TRANSFERENCIA" });

    // Febrero
    await crearVenta({ clienteId: panaderia.id, fecha: new Date("2026-02-03"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 20, precioUnitario: 15000 }, { productTypeId: ptCampesino.id, cantidadKg: 8, precioUnitario: 17500 }], pagoMonto: 440000 });
    await crearVenta({ clienteId: restDelicias.id, fecha: new Date("2026-02-10"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 15, precioUnitario: 18000 }, { productTypeId: ptBlanco.id, cantidadKg: 10, precioUnitario: 14000 }], pagoMonto: 410000 });
    await crearVenta({ clienteId: mariaG.id, fecha: new Date("2026-02-14"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 5, precioUnitario: 15000 }], pagoMonto: 75000 });
    await crearVenta({ clienteId: hotelCampestre.id, fecha: new Date("2026-02-20"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: admin.id, notas: "Pedido para evento de temporada", items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 30, precioUnitario: 18500 }, { productTypeId: ptCampesino.id, cantidadKg: 15, precioUnitario: 17000 }, { productTypeId: ptCosteno.id, cantidadKg: 10, precioUnitario: 15500 }], pagoMonto: 973000 });
    await crearVenta({ clienteId: cafeteria.id, fecha: new Date("2026-02-27"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 12, precioUnitario: 15000 }], pagoMonto: 180000 });

    // Marzo
    await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-03-04"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 28, precioUnitario: 14000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 12, precioUnitario: 18000 }], pagoMonto: 608000 });
    await crearVenta({ clienteId: distribuidora.id, fecha: new Date("2026-03-10"), metodoPago: "CREDITO", estado: "PAGADA", createdById: admin.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 80, precioUnitario: 12000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 50, precioUnitario: 16000 }], pagoMonto: 1760000, pagoMetodo: "TRANSFERENCIA" });
    await crearVenta({ clienteId: superCosecha.id, fecha: new Date("2026-03-18"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: admin.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 35, precioUnitario: 12500 }, { productTypeId: ptCosteno.id, cantidadKg: 18, precioUnitario: 14000 }, { productTypeId: ptSuero.id, cantidadKg: 10, precioUnitario: 9000 }], pagoMonto: 784500 });
    await crearVenta({ clienteId: carlosP.id, fecha: new Date("2026-03-22"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 3, precioUnitario: 15000 }, { productTypeId: ptCampesino.id, cantidadKg: 2, precioUnitario: 18000 }], pagoMonto: 81000 });
    await crearVenta({ clienteId: panaderia.id, fecha: new Date("2026-03-29"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: secretaria.id, notas: "Pedido extra semana santa", items: [{ productTypeId: ptBlanco.id, cantidadKg: 30, precioUnitario: 15000 }, { productTypeId: ptCampesino.id, cantidadKg: 12, precioUnitario: 17500 }], pagoMonto: 660000 });

    // Abril — admin/secretaria + domiciliarios
    await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-04-08"), metodoPago: "CREDITO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 25, precioUnitario: 14000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 10, precioUnitario: 18000 }], pagoMonto: 530000, pagoMetodo: "TRANSFERENCIA" });
    await crearVenta({ clienteId: hotelCampestre.id, fecha: new Date("2026-04-14"), metodoPago: "TRANSFERENCIA", estado: "PENDIENTE", createdById: admin.id, notas: "Pedido quincenal", items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 20, precioUnitario: 18500 }, { productTypeId: ptCampesino.id, cantidadKg: 10, precioUnitario: 17000 }] });
    await crearVenta({ clienteId: tiendaJorge.id, fecha: new Date("2026-04-17"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 18, precioUnitario: 15000 }], pagoMonto: 270000 });
    await crearVenta({ clienteId: distribuidora.id, fecha: new Date("2026-04-20"), metodoPago: "CREDITO", estado: "PENDIENTE", createdById: admin.id, notas: "Pedido mensual — pendiente transferencia", items: [{ productTypeId: ptBlanco.id, cantidadKg: 70, precioUnitario: 12000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 40, precioUnitario: 16000 }, { productTypeId: ptCosteno.id, cantidadKg: 20, precioUnitario: 14000 }] });
    await crearVenta({ clienteId: cafeteria.id, fecha: new Date("2026-04-22"), metodoPago: "TRANSFERENCIA", estado: "PAGADA", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 10, precioUnitario: 15000 }, { productTypeId: ptSuero.id, cantidadKg: 5, precioUnitario: 12000 }], pagoMonto: 210000 });
    await crearVenta({ clienteId: mariaG.id, fecha: new Date("2026-04-23"), metodoPago: "EFECTIVO", estado: "PENDIENTE", createdById: secretaria.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 4, precioUnitario: 15000 }] });

    // Ventas por domiciliario1 (Carlos Pineda — Ruta Norte)
    await crearVenta({ clienteId: tiendaJorge.id, fecha: new Date("2026-04-07"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: domiciliario1.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 8, precioUnitario: 15000 }], pagoMonto: 120000 });
    await crearVenta({ clienteId: mariaG.id, fecha: new Date("2026-04-09"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: domiciliario1.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 3, precioUnitario: 15000 }, { productTypeId: ptCampesino.id, cantidadKg: 1, precioUnitario: 18000 }], pagoMonto: 63000 });
    await crearVenta({ clienteId: panaderia.id, fecha: new Date("2026-04-15"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: domiciliario1.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 12, precioUnitario: 15000 }, { productTypeId: ptCampesino.id, cantidadKg: 5, precioUnitario: 17500 }], pagoMonto: 267500 });
    await crearVenta({ clienteId: carlosP.id, fecha: new Date("2026-04-21"), metodoPago: "EFECTIVO", estado: "PENDIENTE", createdById: domiciliario1.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 2, precioUnitario: 15000 }] });

    // Ventas por domiciliario2 (Andrés Gómez — Ruta Sur)
    await crearVenta({ clienteId: restDelicias.id, fecha: new Date("2026-04-08"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: domiciliario2.id, items: [{ productTypeId: ptDobleCrema.id, cantidadKg: 8, precioUnitario: 18000 }, { productTypeId: ptBlanco.id, cantidadKg: 6, precioUnitario: 14000 }], pagoMonto: 228000 });
    await crearVenta({ clienteId: cafeteria.id, fecha: new Date("2026-04-11"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: domiciliario2.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 5, precioUnitario: 15000 }], pagoMonto: 75000 });
    await crearVenta({ clienteId: restBuenSabor.id, fecha: new Date("2026-04-18"), metodoPago: "EFECTIVO", estado: "PAGADA", createdById: domiciliario2.id, items: [{ productTypeId: ptBlanco.id, cantidadKg: 15, precioUnitario: 14000 }, { productTypeId: ptDobleCrema.id, cantidadKg: 6, precioUnitario: 18000 }], pagoMonto: 318000 });
    await crearVenta({ clienteId: restDelicias.id, fecha: new Date("2026-04-24"), metodoPago: "CREDITO", estado: "PENDIENTE", createdById: domiciliario2.id, items: [{ productTypeId: ptCosteno.id, cantidadKg: 5, precioUnitario: 15500 }, { productTypeId: ptBlanco.id, cantidadKg: 8, precioUnitario: 14000 }] });

    console.log("Ventas y pagos creados");
  }

  // ── Devoluciones ───────────────────────────────────────────────────────────
  const devolucionesExistentes = await prisma.devolucion.count();
  if (devolucionesExistentes === 0) {
    // Necesitamos una venta existente para referenciar
    const [ventaHotel, ventaDistrib, ventaRest] = await Promise.all([
      prisma.venta.findFirst({ where: { clienteId: hotelCampestre.id } }),
      prisma.venta.findFirst({ where: { clienteId: distribuidora.id } }),
      prisma.venta.findFirst({ where: { clienteId: restBuenSabor.id } }),
    ]);

    await Promise.all([
      prisma.devolucion.create({
        data: {
          clienteId: hotelCampestre.id,
          ventaId: ventaHotel?.id,
          motivo: "Producto en mal estado — detectado al abrir el embalaje",
          estado: "REGISTRADA",
          createdById: admin.id,
          createdAt: new Date("2026-04-15"),
          items: {
            create: [{ productTypeId: ptDobleCrema.id, cantidadKg: 2, razon: "Queso con moho visible" }],
          },
        },
      }),
      prisma.devolucion.create({
        data: {
          clienteId: distribuidora.id,
          ventaId: ventaDistrib?.id,
          motivo: "Excedente de pedido — el cliente recibió más cantidad de la solicitada",
          estado: "REGISTRADA",
          createdById: admin.id,
          createdAt: new Date("2026-04-21"),
          items: {
            create: [
              { productTypeId: ptBlanco.id, cantidadKg: 5, razon: "Despacho por error" },
              { productTypeId: ptDobleCrema.id, cantidadKg: 3, razon: "Despacho por error" },
            ],
          },
        },
      }),
      prisma.devolucion.create({
        data: {
          clienteId: restBuenSabor.id,
          ventaId: ventaRest?.id,
          motivo: "Cambio de pedido — sustitución por otro tipo",
          estado: "REGISTRADA",
          createdById: secretaria.id,
          createdAt: new Date("2026-04-16"),
          items: {
            create: [{ productTypeId: ptBlanco.id, cantidadKg: 1.5, razon: "Cliente solicitó cambio por Queso Campesino" }],
          },
        },
      }),
    ]);
    console.log("Devoluciones creadas");
  } else {
    console.log("Devoluciones ya existían");
  }

  // ── Cortes de caja ─────────────────────────────────────────────────────────
  const cajasExistentes = await prisma.corteCaja.count();
  if (cajasExistentes === 0) {
    await Promise.all([
      prisma.corteCaja.create({
        data: {
          fecha: new Date("2026-02-28T18:00:00"),
          totalEfectivo: 921500,
          totalTransferencia: 1383000,
          montoDeclarado: 925000,
          diferencia: 3500,
          notas: "Diferencia por billete de $5.000 mal contado al inicio",
          estado: "CERRADO",
          createdById: admin.id,
        },
      }),
      prisma.corteCaja.create({
        data: {
          fecha: new Date("2026-03-31T18:00:00"),
          totalEfectivo: 1313000,
          totalTransferencia: 2644500,
          montoDeclarado: 1313000,
          diferencia: 0,
          notas: "Cierre exacto — mes de semana santa",
          estado: "CERRADO",
          createdById: admin.id,
        },
      }),
      prisma.corteCaja.create({
        data: {
          fecha: new Date("2026-04-24T17:30:00"),
          totalEfectivo: 1071500,
          totalTransferencia: 880000,
          montoDeclarado: null,
          diferencia: null,
          notas: "Corte parcial de abril — mes en curso",
          estado: "CERRADO",
          createdById: secretaria.id,
        },
      }),
    ]);
    console.log("Cortes de caja creados");
  } else {
    console.log("Cortes de caja ya existían");
  }

  // ── Notificaciones ─────────────────────────────────────────────────────────
  const notifsExistentes = await prisma.notification.count();
  if (notifsExistentes === 0) {
    await Promise.all([
      prisma.notification.create({ data: { title: "Stock bajo: Queso Costeño", message: "El lote L-2026-011 tiene menos de 50 kg disponibles.", targetRoles: ["Root", "Administrador"], createdById: admin.id, createdAt: new Date("2026-04-22") } }),
      prisma.notification.create({ data: { title: "Pedido pendiente de pago", message: "Distribuidora Lácteos del Sur tiene un pedido de $1.5M pendiente de transferencia.", targetRoles: ["Root", "Administrador", "Secretaria"], createdById: admin.id, createdAt: new Date("2026-04-21") } }),
      prisma.notification.create({ data: { title: "Nuevo lote ingresado", message: "Se registró el lote L-2026-013 de Suero Costeño: 50 kg.", targetRoles: ["Root", "Administrador"], createdById: admin.id, createdAt: new Date("2026-04-20") } }),
      prisma.notification.create({ data: { title: "Devolución registrada", message: "Hotel Campestre San Luis devolvió 2 kg de Queso Doble Crema — revisar lote.", targetRoles: ["Root", "Administrador", "Secretaria"], createdById: admin.id, createdAt: new Date("2026-04-15") } }),
    ]);
    console.log("Notificaciones creadas");
  }

  console.log("\n✓ Semilla completada");
  console.log("  Usuarios de prueba:");
  console.log("    root@orocampo.com         / root123");
  console.log("    julian@orocampo.com       / julian123");
  console.log("    secretaria@orocampo.com   / secretaria123");
  console.log("    domiciliario@orocampo.com / domiciliario123  (Carlos Pineda — Ruta Norte)");
  console.log("    domiciliario2@orocampo.com/ domiciliario123  (Andrés Gómez — Ruta Sur)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

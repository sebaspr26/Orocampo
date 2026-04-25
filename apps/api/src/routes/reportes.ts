import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.use(requireRole("Root", "Administrador", "Secretaria"));

function parseDateRange(desde?: string, hasta?: string) {
  const from = desde ? new Date(desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);
  const to = hasta ? new Date(hasta) : new Date();
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function pct(part: number, total: number) { return total > 0 ? Math.round((part / total) * 1000) / 10 : 0; }

// GET /reportes/ventas-periodo
router.get("/ventas-periodo", async (req: AuthRequest, res) => {
  const { desde, hasta, agrupacion = "dia" } = req.query as Record<string, string>;
  const { from, to } = parseDateRange(desde, hasta);

  try {
    const ventas = await prisma.venta.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { id: true, total: true, estado: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    type PeriodoGroup = {
      montoEfectivo: number;
      totalVentas: number;
      ventasEfectivas: number;
      ventasPagadas: number;
      ventasPendientes: number;
      ventasAnuladas: number;
    };
    const groups: Record<string, PeriodoGroup> = {};

    for (const v of ventas) {
      const d = new Date(v.createdAt);
      let periodo: string;
      if (agrupacion === "mes") {
        periodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else if (agrupacion === "semana") {
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        periodo = `${d.getFullYear()}-S${String(week).padStart(2, "0")}`;
      } else {
        periodo = d.toISOString().split("T")[0];
      }
      if (!groups[periodo]) groups[periodo] = { montoEfectivo: 0, totalVentas: 0, ventasEfectivas: 0, ventasPagadas: 0, ventasPendientes: 0, ventasAnuladas: 0 };
      const g = groups[periodo];
      g.totalVentas++;
      if (v.estado === "PAGADA") { g.ventasPagadas++; g.ventasEfectivas++; g.montoEfectivo += v.total; }
      else if (v.estado === "PENDIENTE") { g.ventasPendientes++; g.ventasEfectivas++; g.montoEfectivo += v.total; }
      else if (v.estado === "ANULADA") { g.ventasAnuladas++; }
    }

    const rows = Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, g]) => ({
        periodo,
        totalVentas: g.totalVentas,
        ventasEfectivas: g.ventasEfectivas,
        montoEfectivo: round2(g.montoEfectivo),
        ventasPagadas: g.ventasPagadas,
        ventasPendientes: g.ventasPendientes,
        ventasAnuladas: g.ventasAnuladas,
        tasaCobranza: pct(g.ventasPagadas, g.ventasEfectivas),
      }));

    const totEfectivas = rows.reduce((s, r) => s + r.ventasEfectivas, 0);
    const totPagadas = rows.reduce((s, r) => s + r.ventasPagadas, 0);
    const totMonto = rows.reduce((s, r) => s + r.montoEfectivo, 0);
    const totAnuladas = rows.reduce((s, r) => s + r.ventasAnuladas, 0);
    const totTotal = rows.reduce((s, r) => s + r.totalVentas, 0);

    res.json({
      rows,
      totales: {
        totalVentas: totTotal,
        ventasEfectivas: totEfectivas,
        montoEfectivo: round2(totMonto),
        tasaCobranzaGlobal: pct(totPagadas, totEfectivas),
        tasaAnulacion: pct(totAnuladas, totTotal),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/ventas-producto
router.get("/ventas-producto", async (req: AuthRequest, res) => {
  const { desde, hasta } = req.query as Record<string, string>;
  const { from, to } = parseDateRange(desde, hasta);

  try {
    const items = await prisma.itemVenta.findMany({
      where: { venta: { createdAt: { gte: from, lte: to }, estado: { not: "ANULADA" } } },
      include: { productType: { select: { name: true } } },
    });

    const groups: Record<string, { nombre: string; totalKg: number; montoTotal: number; ventaIds: Set<string> }> = {};
    for (const item of items) {
      const key = item.productTypeId;
      if (!groups[key]) groups[key] = { nombre: item.productType.name, totalKg: 0, montoTotal: 0, ventaIds: new Set() };
      groups[key].totalKg += item.cantidadKg;
      groups[key].montoTotal += item.subtotal;
      groups[key].ventaIds.add(item.ventaId);
    }

    const unsorted = Object.entries(groups).map(([id, g]) => ({
      productTypeId: id,
      nombre: g.nombre,
      totalKg: round2(g.totalKg),
      montoTotal: round2(g.montoTotal),
      numVentas: g.ventaIds.size,
      precioPromedio: g.totalKg > 0 ? round2(g.montoTotal / g.totalKg) : 0,
    })).sort((a, b) => b.montoTotal - a.montoTotal);

    const totalIngresos = unsorted.reduce((s, r) => s + r.montoTotal, 0);
    const rows = unsorted.map(r => ({ ...r, participacion: pct(r.montoTotal, totalIngresos) }));

    res.json({
      rows,
      totales: {
        totalKg: round2(rows.reduce((s, r) => s + r.totalKg, 0)),
        totalIngresos: round2(totalIngresos),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/ventas-cliente
router.get("/ventas-cliente", async (req: AuthRequest, res) => {
  const { desde, hasta } = req.query as Record<string, string>;
  const { from, to } = parseDateRange(desde, hasta);

  try {
    const ventas = await prisma.venta.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: {
        cliente: { select: { id: true, nombre: true } },
        pagos: { select: { monto: true } },
      },
    });

    const groups: Record<string, { nombre: string; numVentas: number; montoTotal: number; montoPagado: number; ultimaVenta: Date }> = {};
    for (const v of ventas) {
      if (v.estado === "ANULADA") continue;
      const pagado = v.pagos.reduce((s: number, p: { monto: number }) => s + p.monto, 0);
      const key = v.clienteId;
      if (!groups[key]) groups[key] = { nombre: v.cliente.nombre, numVentas: 0, montoTotal: 0, montoPagado: 0, ultimaVenta: v.createdAt };
      groups[key].numVentas++;
      groups[key].montoTotal += v.total;
      groups[key].montoPagado += pagado;
      if (v.createdAt > groups[key].ultimaVenta) groups[key].ultimaVenta = v.createdAt;
    }

    const unsorted = Object.entries(groups).map(([id, g]) => {
      const cartera = round2(g.montoTotal - g.montoPagado);
      const riesgoRatio = g.montoTotal > 0 ? cartera / g.montoTotal : 0;
      return {
        clienteId: id,
        nombre: g.nombre,
        numVentas: g.numVentas,
        montoTotal: round2(g.montoTotal),
        montoPagado: round2(g.montoPagado),
        cartera,
        ultimaVenta: g.ultimaVenta,
        riesgo: riesgoRatio > 0.4 ? "alto" : riesgoRatio > 0.1 ? "medio" : "bajo",
      };
    }).sort((a, b) => b.montoTotal - a.montoTotal);

    const totalFacturado = unsorted.reduce((s, r) => s + r.montoTotal, 0);
    const rows = unsorted.map(r => ({ ...r, participacion: pct(r.montoTotal, totalFacturado) }));

    res.json({
      rows,
      totales: {
        totalFacturado: round2(totalFacturado),
        totalCartera: round2(rows.reduce((s, r) => s + r.cartera, 0)),
        totalPagado: round2(rows.reduce((s, r) => s + r.montoPagado, 0)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/cartera
router.get("/cartera", async (_req: AuthRequest, res) => {
  try {
    const ventasPendientes = await prisma.venta.findMany({
      where: { estado: "PENDIENTE" },
      include: {
        cliente: { select: { id: true, nombre: true } },
        pagos: { select: { monto: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const groups: Record<string, { nombre: string; numVentas: number; totalPendiente: number; ventaMasAntigua: Date }> = {};
    const now = new Date();

    for (const v of ventasPendientes) {
      const pagado = v.pagos.reduce((s: number, p: { monto: number }) => s + p.monto, 0);
      const pendiente = v.total - pagado;
      if (pendiente <= 0) continue;
      const key = v.clienteId;
      if (!groups[key]) groups[key] = { nombre: v.cliente.nombre, numVentas: 0, totalPendiente: 0, ventaMasAntigua: v.createdAt };
      groups[key].numVentas++;
      groups[key].totalPendiente += pendiente;
      if (v.createdAt < groups[key].ventaMasAntigua) groups[key].ventaMasAntigua = v.createdAt;
    }

    const rows = Object.entries(groups).map(([id, g]) => {
      const dias = Math.floor((now.getTime() - g.ventaMasAntigua.getTime()) / (1000 * 60 * 60 * 24));
      return {
        clienteId: id,
        nombre: g.nombre,
        numVentas: g.numVentas,
        totalPendiente: round2(g.totalPendiente),
        ventaMasAntigua: g.ventaMasAntigua,
        diasVencida: dias,
        urgencia: dias > 60 ? "critica" : dias > 30 ? "alta" : dias > 7 ? "media" : "baja",
      };
    }).sort((a, b) => b.totalPendiente - a.totalPendiente);

    const aging = { baja: 0, media: 0, alta: 0, critica: 0 };
    for (const r of rows) aging[r.urgencia as keyof typeof aging] += r.totalPendiente;

    res.json({
      rows,
      totalCartera: round2(rows.reduce((s, r) => s + r.totalPendiente, 0)),
      aging: { baja: round2(aging.baja), media: round2(aging.media), alta: round2(aging.alta), critica: round2(aging.critica) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/inventario
router.get("/inventario", async (_req: AuthRequest, res) => {
  try {
    const now = new Date();
    const alertThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [entries, tipos, salesItems] = await Promise.all([
      prisma.inventoryEntry.findMany({
        include: { productType: { select: { name: true } } },
        orderBy: { expiryDate: "asc" },
      }),
      prisma.productType.findMany({
        include: { entries: { where: { remainingKg: { gt: 0 } }, select: { remainingKg: true, purchasePrice: true } } },
      }),
      prisma.itemVenta.findMany({
        where: { venta: { createdAt: { gte: thirtyDaysAgo }, estado: { not: "ANULADA" } } },
        select: { productTypeId: true, cantidadKg: true },
      }),
    ]);

    // avg daily consumption per product type (last 30 days)
    const consumption: Record<string, number> = {};
    for (const item of salesItems) {
      consumption[item.productTypeId] = (consumption[item.productTypeId] ?? 0) + item.cantidadKg;
    }
    const avgDailyConsumption: Record<string, number> = {};
    for (const [id, total] of Object.entries(consumption)) {
      avgDailyConsumption[id] = total / 30;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vencidos = (entries as any[])
      .filter((e: any) => new Date(e.expiryDate) < now && e.remainingKg > 0)
      .map((e: any) => ({
        id: e.id,
        producto: e.productType.name,
        lote: e.batchNumber,
        cantidadKg: round2(e.remainingKg),
        fechaVencimiento: e.expiryDate,
        diasVencido: Math.floor((now.getTime() - new Date(e.expiryDate).getTime()) / (1000 * 60 * 60 * 24)),
        costoEstimado: round2(e.remainingKg * e.purchasePrice),
      }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proximosAVencer = (entries as any[])
      .filter((e: any) => {
        const exp = new Date(e.expiryDate);
        return exp >= now && exp <= alertThreshold && e.remainingKg > 0;
      })
      .map((e: any) => ({
        id: e.id,
        producto: e.productType.name,
        lote: e.batchNumber,
        cantidadKg: round2(e.remainingKg),
        fechaVencimiento: e.expiryDate,
        diasRestantes: Math.ceil((new Date(e.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockActual = (tipos as any[]).map((t: any) => {
      const stock = t.entries.reduce((s: number, e: any) => s + e.remainingKg, 0);
      const costo = t.entries.reduce((s: number, e: any) => s + e.remainingKg * e.purchasePrice, 0);
      const avgDaily = avgDailyConsumption[t.id] ?? 0;
      return {
        id: t.id,
        nombre: t.name,
        totalKg: round2(stock),
        costoEstimado: round2(costo),
        minStockKg: t.minStockKg,
        stockBajo: stock < t.minStockKg,
        coberturaDias: avgDaily > 0 ? Math.round(stock / avgDaily) : null,
      };
    }).sort((a: any, b: any) => b.totalKg - a.totalKg);

    res.json({
      stockActual,
      vencidos,
      proximosAVencer,
      totalPerdidaEstimada: round2(vencidos.reduce((s: number, v: any) => s + v.costoEstimado, 0)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/margen
router.get("/margen", async (req: AuthRequest, res) => {
  const { desde, hasta } = req.query as Record<string, string>;
  const { from, to } = parseDateRange(desde, hasta);

  try {
    const [items, allEntries] = await Promise.all([
      prisma.itemVenta.findMany({
        where: { venta: { createdAt: { gte: from, lte: to }, estado: { not: "ANULADA" } } },
        include: { productType: { select: { id: true, name: true } } },
      }),
      prisma.inventoryEntry.findMany({
        select: { productTypeId: true, quantityKg: true, purchasePrice: true },
      }),
    ]);

    const totalCostByType: Record<string, number> = {};
    const totalKgByType: Record<string, number> = {};
    for (const e of allEntries) {
      totalCostByType[e.productTypeId] = (totalCostByType[e.productTypeId] ?? 0) + e.purchasePrice * e.quantityKg;
      totalKgByType[e.productTypeId] = (totalKgByType[e.productTypeId] ?? 0) + e.quantityKg;
    }
    const avgCost: Record<string, number> = {};
    for (const id of Object.keys(totalCostByType)) {
      avgCost[id] = totalKgByType[id] > 0 ? totalCostByType[id] / totalKgByType[id] : 0;
    }

    const groups: Record<string, { nombre: string; kgVendidos: number; ingresos: number }> = {};
    for (const item of items) {
      const key = item.productTypeId;
      if (!groups[key]) groups[key] = { nombre: item.productType.name, kgVendidos: 0, ingresos: 0 };
      groups[key].kgVendidos += item.cantidadKg;
      groups[key].ingresos += item.subtotal;
    }

    const unsorted = Object.entries(groups).map(([id, g]) => {
      const costoUnitario = avgCost[id] ?? 0;
      const costoTotal = g.kgVendidos * costoUnitario;
      const margenBruto = g.ingresos - costoTotal;
      const margenPct = pct(margenBruto, g.ingresos);
      return {
        productTypeId: id,
        nombre: g.nombre,
        kgVendidos: round2(g.kgVendidos),
        ingresos: round2(g.ingresos),
        costoUnitario: round2(costoUnitario),
        costoTotal: round2(costoTotal),
        margenBruto: round2(margenBruto),
        margenPct,
        categoria: margenPct >= 30 ? "estrella" : margenPct >= 10 ? "aceptable" : margenPct >= 0 ? "bajo" : "negativo",
      };
    }).sort((a, b) => b.ingresos - a.ingresos);

    const totIngresos = unsorted.reduce((s, r) => s + r.ingresos, 0);
    const rows = unsorted.map(r => ({ ...r, participacion: pct(r.ingresos, totIngresos) }));

    const totCosto = rows.reduce((s, r) => s + r.costoTotal, 0);
    const totMargen = totIngresos - totCosto;

    res.json({
      rows,
      totales: {
        ingresos: round2(totIngresos),
        costoTotal: round2(totCosto),
        margenBruto: round2(totMargen),
        margenPct: pct(totMargen, totIngresos),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/devoluciones — reporte de pérdidas por devolución (RF-38)
router.get("/devoluciones", async (req: AuthRequest, res) => {
  const { desde, hasta } = req.query as Record<string, string>;
  const { from, to } = parseDateRange(desde, hasta);

  try {
    const devoluciones = await prisma.devolucion.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: {
        cliente: { select: { id: true, nombre: true } },
        items: { include: { productType: { select: { name: true } } } },
      },
    });

    const perdidas: Record<string, { nombre: string; totalKg: number; count: number; clientes: Set<string> }> = {};
    let totalKg = 0;

    for (const d of devoluciones) {
      for (const item of d.items) {
        const key = item.productTypeId;
        if (!perdidas[key]) perdidas[key] = { nombre: item.productType.name, totalKg: 0, count: 0, clientes: new Set() };
        perdidas[key].totalKg += item.cantidadKg;
        perdidas[key].count++;
        perdidas[key].clientes.add(d.clienteId);
        totalKg += item.cantidadKg;
      }
    }

    const porRazon: Record<string, number> = { CLIENTE_RECHAZO: 0, VENCIDO: 0, MAL_ESTADO: 0, EXCESO: 0 };
    devoluciones.forEach(d => d.items.forEach(i => { if (i.razon in porRazon) porRazon[i.razon] += i.cantidadKg; }));

    const rows = Object.entries(perdidas).map(([id, g]) => ({
      productTypeId: id,
      nombre: g.nombre,
      totalKg: round2(g.totalKg),
      numDevoluciones: g.count,
      numClientes: g.clientes.size,
    })).sort((a, b) => b.totalKg - a.totalKg);

    res.json({
      rows,
      totalDevoluciones: devoluciones.length,
      totalKgDevuelto: round2(totalKg),
      porRazon: {
        CLIENTE_RECHAZO: round2(porRazon.CLIENTE_RECHAZO),
        VENCIDO: round2(porRazon.VENCIDO),
        MAL_ESTADO: round2(porRazon.MAL_ESTADO),
        EXCESO: round2(porRazon.EXCESO),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// GET /reportes/rotacion — rotación de productos (RF-46)
router.get("/rotacion", async (req: AuthRequest, res) => {
  const { desde, hasta } = req.query as Record<string, string>;
  const { from, to } = parseDateRange(desde, hasta);
  const dias = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

  try {
    const [items, tipos] = await Promise.all([
      prisma.itemVenta.findMany({
        where: { venta: { createdAt: { gte: from, lte: to }, estado: { not: "ANULADA" } } },
        include: { productType: { select: { id: true, name: true } } },
      }),
      prisma.productType.findMany({
        include: { entries: { where: { remainingKg: { gt: 0 } }, select: { remainingKg: true } } },
      }),
    ]);

    const vendidoPorTipo: Record<string, { nombre: string; kgVendidos: number; numVentas: number }> = {};
    for (const item of items) {
      const key = item.productTypeId;
      if (!vendidoPorTipo[key]) vendidoPorTipo[key] = { nombre: item.productType.name, kgVendidos: 0, numVentas: 0 };
      vendidoPorTipo[key].kgVendidos += item.cantidadKg;
      vendidoPorTipo[key].numVentas++;
    }

    const rows = tipos.map(t => {
      const stockActual = t.entries.reduce((s, e) => s + e.remainingKg, 0);
      const kgVendidos = vendidoPorTipo[t.id]?.kgVendidos ?? 0;
      const kgPorDia = dias > 0 ? kgVendidos / dias : 0;
      const coberturaDias = kgPorDia > 0 ? Math.round(stockActual / kgPorDia) : null;
      return {
        id: t.id,
        nombre: t.name,
        stockActual: round2(stockActual),
        kgVendidos: round2(kgVendidos),
        kgPorDia: round2(kgPorDia),
        coberturaDias,
        rotacion: kgVendidos === 0 ? "sin_movimiento" : kgPorDia > 5 ? "alta" : kgPorDia > 1 ? "media" : "baja",
      };
    }).sort((a, b) => b.kgVendidos - a.kgVendidos);

    res.json({ rows, diasPeriodo: dias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

export default router;

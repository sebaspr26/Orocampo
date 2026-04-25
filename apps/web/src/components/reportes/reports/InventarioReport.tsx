"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, exportCSV } from "../shared/reportUtils";

interface StockRow {
  id: string;
  nombre: string;
  totalKg: number;
  costoEstimado: number;
  minStockKg: number;
  stockBajo: boolean;
  coberturaDias: number | null;
}
interface VencimientoRow {
  id: string;
  producto: string;
  lote: string;
  cantidadKg: number;
  fechaVencimiento: string;
  diasRestantes: number;
}
interface VencidoRow {
  id: string;
  producto: string;
  lote: string;
  cantidadKg: number;
  fechaVencimiento: string;
  diasVencido: number;
  costoEstimado: number;
}
interface InventarioData {
  stockActual: StockRow[];
  vencidos: VencidoRow[];
  proximosAVencer: VencimientoRow[];
  totalPerdidaEstimada: number;
}

type Tab = "stock" | "vencimientos" | "vencidos";

export function InventarioReport() {
  const [tab, setTab] = useState<Tab>("stock");
  const { data, loading, error, fetchReport } = useReport<InventarioData>();

  useEffect(() => { fetchReport("inventario"); }, [fetchReport]);

  const handleExportStock = () => {
    if (!data) return;
    exportCSV(
      "inventario_stock",
      ["Producto", "Stock kg", "Costo estimado", "Stock mínimo", "Cobertura (días)", "Estado"],
      data.stockActual.map(r => [r.nombre, r.totalKg, r.costoEstimado, r.minStockKg, r.coberturaDias ?? "N/D", r.stockBajo ? "Bajo" : "Normal"])
    );
  };

  const stockBajos = data?.stockActual.filter(r => r.stockBajo) ?? [];
  const urgentesVencer = data?.proximosAVencer.filter(r => r.diasRestantes <= 3) ?? [];

  return (
    <ReportPanel
      title="Inventario y Pérdidas" desc="Stock actual, cobertura, vencimientos y pérdidas estimadas"
      hasDateRange={false} hasAgrupacion={false}
      dateFrom="" dateTo="" agrupacion="dia"
      onDateFromChange={() => {}} onDateToChange={() => {}} onAgrupacionChange={() => {}}
      onGenerate={() => fetchReport("inventario")} onExport={tab === "stock" ? handleExportStock : undefined}
      loading={loading} error={error} hasData={!!data}
    >
      {data && (
        <>
          {/* Insights */}
          {stockBajos.length > 0 && (
            <InsightBanner type="warning" icon="inventory_2"
              message={`Stock bajo en ${stockBajos.length} producto${stockBajos.length > 1 ? "s" : ""}: ${stockBajos.map(r => r.nombre).join(", ")}. Programa reposición.`} />
          )}
          {urgentesVencer.length > 0 && (
            <InsightBanner type="error" icon="hourglass_empty"
              message={`${urgentesVencer.length} lote${urgentesVencer.length > 1 ? "s" : ""} vence${urgentesVencer.length === 1 ? "" : "n"} en ≤3 días. Prioriza su venta o descuento.`} />
          )}
          {data.vencidos.length > 0 && (
            <InsightBanner type="error" icon="dangerous"
              message={`${data.vencidos.length} lote${data.vencidos.length > 1 ? "s" : ""} vencido${data.vencidos.length > 1 ? "s" : ""} con stock. Pérdida estimada: ${cop(data.totalPerdidaEstimada)}. Da de baja estos lotes.`} />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Stock total"
              value={`${data.stockActual.reduce((s, r) => s + r.totalKg, 0).toFixed(1)} kg`}
              sub={`${data.stockActual.length} tipos de producto`}
            />
            <StatCard
              label="Valor del inventario"
              value={cop(data.stockActual.reduce((s, r) => s + r.costoEstimado, 0))}
            />
            <StatCard
              label="Stock bajo"
              value={String(stockBajos.length)}
              sub={stockBajos.length > 0 ? "Requieren reposición" : "Todo en niveles normales"}
              status={stockBajos.length > 0 ? "warning" : "success"}
            />
            <StatCard
              label="Pérdida potencial"
              value={cop(data.totalPerdidaEstimada)}
              sub={`${data.vencidos.length} lote${data.vencidos.length !== 1 ? "s" : ""} vencido${data.vencidos.length !== 1 ? "s" : ""}`}
              status={data.totalPerdidaEstimada > 0 ? "error" : "success"}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-[#f0eded] rounded-2xl w-fit">
            {([
              { key: "stock", label: "Stock actual" },
              { key: "vencimientos", label: `Próximos a vencer (${data.proximosAVencer.length})` },
              { key: "vencidos", label: `Vencidos (${data.vencidos.length})` },
            ] as { key: Tab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`btn btn-sm rounded-xl ${tab === t.key ? "bg-white text-[#735c00] shadow-sm" : "text-[#4d4635]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "stock" && <TabStock rows={data.stockActual} />}
          {tab === "vencimientos" && <TabVencimientos rows={data.proximosAVencer} />}
          {tab === "vencidos" && <TabVencidos rows={data.vencidos} />}
        </>
      )}
    </ReportPanel>
  );
}

function TabStock({ rows }: { rows: StockRow[] }) {
  if (!rows.length) return <Empty icon="inventory_2" label="Sin productos en inventario." />;
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr>
            {["Producto", "Stock disponible", "Valor estimado", "Stock mínimo", "Cobertura", "Estado"].map(h => (
              <th key={h} className="table-header-cell">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="table-row">
              <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
              <td className="table-cell">
                <div className="flex items-center gap-2">
                  <span>{r.totalKg} kg</span>
                  {r.totalKg < r.minStockKg && (
                    <span className="text-xs text-[#ba1a1a] font-medium">
                      (faltan {(r.minStockKg - r.totalKg).toFixed(1)} kg)
                    </span>
                  )}
                </div>
              </td>
              <td className="table-cell text-[#4d4635]">{cop(r.costoEstimado)}</td>
              <td className="table-cell text-[#4d4635]">{r.minStockKg} kg</td>
              <td className="table-cell">
                {r.coberturaDias !== null
                  ? <CoberturaChip dias={r.coberturaDias} />
                  : <span className="text-xs text-[#7f7663]">Sin consumo reciente</span>}
              </td>
              <td className="table-cell">
                <span className={`badge ${r.stockBajo ? "badge-error" : "badge-success"}`}>
                  {r.stockBajo ? "Stock bajo" : "Normal"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoberturaChip({ dias }: { dias: number }) {
  const status = dias <= 3 ? "badge-error" : dias <= 7 ? "badge-warning" : "badge-success";
  return <span className={`badge ${status}`}>{dias}d de stock</span>;
}

function TabVencimientos({ rows }: { rows: VencimientoRow[] }) {
  if (!rows.length) return <Empty icon="event_available" label="Sin vencimientos próximos en los próximos 7 días." />;
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr>
            {["Producto", "Lote", "Cantidad", "Vence el", "Días restantes", "Urgencia"].map(h => (
              <th key={h} className="table-header-cell">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="table-row">
              <td className="table-cell font-semibold text-[#1c1b1b]">{r.producto}</td>
              <td className="table-cell font-mono text-sm text-[#4d4635]">{r.lote}</td>
              <td className="table-cell">{r.cantidadKg} kg</td>
              <td className="table-cell text-[#4d4635]">{formatDate(r.fechaVencimiento)}</td>
              <td className="table-cell font-mono">{r.diasRestantes}d</td>
              <td className="table-cell">
                <span className={`badge ${r.diasRestantes <= 2 ? "badge-error" : r.diasRestantes <= 5 ? "badge-warning" : "badge-info"}`}>
                  {r.diasRestantes <= 2 ? "Urgente" : r.diasRestantes <= 5 ? "Pronto" : "Próximo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabVencidos({ rows }: { rows: VencidoRow[] }) {
  if (!rows.length) return <Empty icon="verified" label="Sin lotes vencidos con stock disponible." />;
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr>
            {["Producto", "Lote", "Cantidad", "Venció el", "Días vencido", "Pérdida estimada"].map(h => (
              <th key={h} className="table-header-cell">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="table-row">
              <td className="table-cell font-semibold text-[#1c1b1b]">{r.producto}</td>
              <td className="table-cell font-mono text-sm text-[#4d4635]">{r.lote}</td>
              <td className="table-cell">{r.cantidadKg} kg</td>
              <td className="table-cell text-[#4d4635]">{formatDate(r.fechaVencimiento)}</td>
              <td className="table-cell"><span className="badge badge-error">{r.diasVencido}d</span></td>
              <td className="table-cell font-semibold text-[#ba1a1a]">{cop(r.costoEstimado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 40 }}>{icon}</span>
      <p className="text-sm text-[#7f7663]">{label}</p>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { formatDate } from "@/lib/format";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, exportCSV } from "../shared/reportUtils";

interface CarteraRow {
  clienteId: string;
  nombre: string;
  numVentas: number;
  totalPendiente: number;
  ventaMasAntigua: string;
  diasVencida: number;
  urgencia: "baja" | "media" | "alta" | "critica";
}
interface CarteraData {
  rows: CarteraRow[];
  totalCartera: number;
  aging: { baja: number; media: number; alta: number; critica: number };
}

const urgenciaBadge = {
  baja: "badge-success",
  media: "badge-info",
  alta: "badge-warning",
  critica: "badge-error",
};

const urgenciaLabel = {
  baja: "Reciente (≤7d)",
  media: "Pendiente (8-30d)",
  alta: "Vencida (31-60d)",
  critica: "Crítica (>60d)",
};

export function CarteraReport() {
  const { data, loading, error, fetchReport } = useReport<CarteraData>();

  useEffect(() => { fetchReport("cartera"); }, [fetchReport]);

  const handleExport = () => {
    if (!data) return;
    exportCSV(
      "cartera",
      ["Cliente", "Facturas pend.", "Total adeudado", "Factura más antigua", "Días", "Urgencia"],
      data.rows.map(r => [r.nombre, r.numVentas, r.totalPendiente, formatDate(r.ventaMasAntigua), r.diasVencida, urgenciaLabel[r.urgencia]])
    );
  };

  const criticas = data?.rows.filter(r => r.urgencia === "critica") ?? [];
  const altas = data?.rows.filter(r => r.urgencia === "alta") ?? [];
  const a = data?.aging;

  return (
    <ReportPanel
      title="Cartera y Cobros" desc="Deuda pendiente por cliente, antigüedad y nivel de urgencia"
      hasDateRange={false} hasAgrupacion={false}
      dateFrom="" dateTo="" agrupacion="dia"
      onDateFromChange={() => {}} onDateToChange={() => {}} onAgrupacionChange={() => {}}
      onGenerate={() => fetchReport("cartera")} onExport={handleExport}
      loading={loading} error={error} hasData={!!data}
    >
      {data && a && (
        <>
          {/* Insights */}
          {criticas.length > 0 && (
            <InsightBanner type="error" icon="warning"
              message={`${criticas.length} cliente${criticas.length > 1 ? "s" : ""} con deuda crítica (más de 60 días): ${criticas.map(c => c.nombre).join(", ")}.`} />
          )}
          {altas.length > 0 && criticas.length === 0 && (
            <InsightBanner type="warning" icon="schedule"
              message={`${altas.length} cliente${altas.length > 1 ? "s" : ""} con deuda vencida entre 31 y 60 días. Prioriza el cobro.`} />
          )}
          {data.rows.length === 0 && (
            <InsightBanner type="success" icon="check_circle" message="Sin cartera pendiente. Todos los clientes están al día." />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Clientes con deuda" value={String(data.rows.length)} />
            <StatCard label="Cartera total" value={cop(data.totalCartera)} status={data.totalCartera > 0 ? "error" : "success"} />
            <StatCard
              label="Deuda crítica (>60d)"
              value={cop(a.critica + a.alta)}
              sub={`${criticas.length + altas.length} cliente${criticas.length + altas.length !== 1 ? "s" : ""}`}
              status={a.critica > 0 ? "error" : a.alta > 0 ? "warning" : "success"}
            />
            <StatCard
              label="Mayor deuda"
              value={data.rows.length > 0 ? cop(data.rows[0].totalPendiente) : "—"}
              sub={data.rows[0]?.nombre}
            />
          </div>

          {/* Aging breakdown */}
          {data.rows.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <AgingBar label="Reciente (≤7d)" value={a.baja} total={data.totalCartera} color="bg-[#065f46]" />
              <AgingBar label="Pendiente (8-30d)" value={a.media} total={data.totalCartera} color="bg-[#1d4ed8]" />
              <AgingBar label="Vencida (31-60d)" value={a.alta} total={data.totalCartera} color="bg-[#d97706]" />
              <AgingBar label="Crítica (>60d)" value={a.critica} total={data.totalCartera} color="bg-[#ba1a1a]" />
            </div>
          )}

          {/* Table */}
          {data.rows.length === 0 ? (
            <EmptyCartera />
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Cliente", "Facturas pend.", "Total adeudado", "Factura más antigua", "Días sin pago", "Urgencia"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map(r => (
                    <tr key={r.clienteId} className="table-row">
                      <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
                      <td className="table-cell">{r.numVentas}</td>
                      <td className="table-cell font-semibold text-[#ba1a1a]">{cop(r.totalPendiente)}</td>
                      <td className="table-cell text-[#4d4635]">{formatDate(r.ventaMasAntigua)}</td>
                      <td className="table-cell font-mono">{r.diasVencida}d</td>
                      <td className="table-cell">
                        <span className={`badge ${urgenciaBadge[r.urgencia]}`}>{urgenciaLabel[r.urgencia]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ReportPanel>
  );
}

function AgingBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-[#f6f3f2] rounded-2xl px-5 py-4">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#7f7663]">{label}</p>
      <p className="text-xl font-extrabold tracking-tighter text-[#1c1b1b] mt-1">{cop(value)}</p>
      <div className="mt-2 h-1.5 rounded-full bg-[#e5e0d9]">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${p}%` }} />
      </div>
      <p className="text-xs text-[#7f7663] mt-1">{p}% del total</p>
    </div>
  );
}

function EmptyCartera() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 40 }}>account_balance</span>
      <p className="text-sm text-[#7f7663]">No hay cartera pendiente de cobro.</p>
    </div>
  );
}

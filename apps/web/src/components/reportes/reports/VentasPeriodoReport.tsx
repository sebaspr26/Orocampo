"use client";
import { useState } from "react";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, toInput, exportCSV } from "../shared/reportUtils";

interface PeriodoRow {
  periodo: string;
  totalVentas: number;
  ventasEfectivas: number;
  montoEfectivo: number;
  ventasPagadas: number;
  ventasPendientes: number;
  ventasAnuladas: number;
  tasaCobranza: number;
}
interface PeriodoData {
  rows: PeriodoRow[];
  totales: { totalVentas: number; ventasEfectivas: number; montoEfectivo: number; tasaCobranzaGlobal: number; tasaAnulacion: number };
}

type Agrupacion = "dia" | "semana" | "mes";

export function VentasPeriodoReport() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toInput(today));
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("dia");
  const { data, loading, error, fetchReport } = useReport<PeriodoData>();

  const generate = () => fetchReport("ventas-periodo", { desde: dateFrom, hasta: dateTo, agrupacion });

  const handleExport = () => {
    if (!data) return;
    exportCSV(
      "ventas_periodo",
      ["Período", "Total ventas", "Ventas efectivas", "Monto efectivo", "Pagadas", "Pendientes", "Anuladas", "% Cobrado"],
      data.rows.map(r => [r.periodo, r.totalVentas, r.ventasEfectivas, r.montoEfectivo, r.ventasPagadas, r.ventasPendientes, r.ventasAnuladas, r.tasaCobranza])
    );
  };

  const t = data?.totales;

  return (
    <ReportPanel
      title="Ventas por Período" desc="Evolución de ventas, cobros y anulaciones en el tiempo"
      hasDateRange hasAgrupacion
      dateFrom={dateFrom} dateTo={dateTo} agrupacion={agrupacion}
      onDateFromChange={setDateFrom} onDateToChange={setDateTo} onAgrupacionChange={setAgrupacion}
      onGenerate={generate} onExport={handleExport}
      loading={loading} error={error} hasData={!!data}
    >
      {t && (
        <>
          {/* Insights */}
          {t.tasaCobranzaGlobal < 70 && (
            <InsightBanner type="warning" icon="payments"
              message={`Solo el ${t.tasaCobranzaGlobal}% de las ventas efectivas están cobradas. Revisa la gestión de cobros.`} />
          )}
          {t.tasaAnulacion > 10 && (
            <InsightBanner type="error" icon="cancel"
              message={`El ${t.tasaAnulacion}% de las ventas fueron anuladas en este período. Investiga las causas.`} />
          )}
          {t.tasaCobranzaGlobal >= 90 && (
            <InsightBanner type="success" icon="task_alt"
              message={`Excelente tasa de cobro: ${t.tasaCobranzaGlobal}% de las ventas están pagadas.`} />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Ventas efectivas" value={String(t.ventasEfectivas)} sub={`${t.totalVentas} totales incl. anuladas`} />
            <StatCard label="Ingresos efectivos" value={cop(t.montoEfectivo)} sub="Excluye anuladas" />
            <StatCard
              label="Tasa de cobro"
              value={`${t.tasaCobranzaGlobal}%`}
              sub="Ventas pagadas / efectivas"
              status={t.tasaCobranzaGlobal >= 80 ? "success" : t.tasaCobranzaGlobal >= 60 ? "warning" : "error"}
            />
            <StatCard
              label="Tasa de anulación"
              value={`${t.tasaAnulacion}%`}
              sub="Del total de ventas"
              status={t.tasaAnulacion <= 5 ? "success" : t.tasaAnulacion <= 10 ? "warning" : "error"}
            />
          </div>

          {/* Table */}
          {data!.rows.length === 0 ? (
            <EmptyRows />
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Período", "Ventas efect.", "Ingresos", "Cobrado", "Pendientes", "Anuladas", "% Cobrado"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data!.rows.map(r => (
                    <tr key={r.periodo} className="table-row">
                      <td className="table-cell font-mono font-semibold text-[#1c1b1b]">{r.periodo}</td>
                      <td className="table-cell">{r.ventasEfectivas}</td>
                      <td className="table-cell font-semibold text-[#1c1b1b]">{cop(r.montoEfectivo)}</td>
                      <td className="table-cell"><span className="badge badge-success">{r.ventasPagadas}</span></td>
                      <td className="table-cell"><span className="badge badge-warning">{r.ventasPendientes}</span></td>
                      <td className="table-cell"><span className="badge badge-neutral">{r.ventasAnuladas}</span></td>
                      <td className="table-cell">
                        <CobranzaBar pct={r.tasaCobranza} />
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

function CobranzaBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-[#065f46]" : pct >= 60 ? "bg-[#d4af37]" : "bg-[#ba1a1a]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-[#f0eded] w-20">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-[#1c1b1b]">{pct}%</span>
    </div>
  );
}

function EmptyRows() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 40 }}>table_chart</span>
      <p className="text-sm text-[#7f7663]">Sin ventas en el período seleccionado.</p>
    </div>
  );
}

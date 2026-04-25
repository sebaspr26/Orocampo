"use client";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, toInput, exportCSV } from "../shared/reportUtils";

interface ClienteRow {
  clienteId: string;
  nombre: string;
  numVentas: number;
  montoTotal: number;
  montoPagado: number;
  cartera: number;
  ultimaVenta: string;
  participacion: number;
  riesgo: "alto" | "medio" | "bajo";
}
interface ClienteData {
  rows: ClienteRow[];
  totales: { totalFacturado: number; totalCartera: number; totalPagado: number };
}

const riesgoBadge = {
  alto: "badge-error",
  medio: "badge-warning",
  bajo: "badge-success",
};

export function VentasClienteReport() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toInput(today));
  const { data, loading, error, fetchReport } = useReport<ClienteData>();

  const generate = () => fetchReport("ventas-cliente", { desde: dateFrom, hasta: dateTo });

  const handleExport = () => {
    if (!data) return;
    exportCSV(
      "ventas_cliente",
      ["Cliente", "Ventas", "Facturado", "% del total", "Pagado", "Cartera", "Riesgo", "Última venta"],
      data.rows.map(r => [r.nombre, r.numVentas, r.montoTotal, r.participacion, r.montoPagado, r.cartera, r.riesgo, formatDate(r.ultimaVenta)])
    );
  };

  const t = data?.totales;
  const clientesRiesgoAlto = data?.rows.filter(r => r.riesgo === "alto").length ?? 0;
  const top = data?.rows[0];

  return (
    <ReportPanel
      title="Ventas por Cliente" desc="Facturación, cobros y riesgo de cartera por cliente"
      hasDateRange hasAgrupacion={false}
      dateFrom={dateFrom} dateTo={dateTo} agrupacion="dia"
      onDateFromChange={setDateFrom} onDateToChange={setDateTo} onAgrupacionChange={() => {}}
      onGenerate={generate} onExport={handleExport}
      loading={loading} error={error} hasData={!!data}
    >
      {data && t && (
        <>
          {/* Insights */}
          {clientesRiesgoAlto > 0 && (
            <InsightBanner type="error" icon="person_alert"
              message={`${clientesRiesgoAlto} cliente${clientesRiesgoAlto > 1 ? "s tienen" : " tiene"} riesgo alto de cartera (más del 40% de su facturación pendiente).`} />
          )}
          {top && (
            <InsightBanner type="info" icon="star"
              message={`"${top.nombre}" es el cliente top: ${top.participacion}% de la facturación (${cop(top.montoTotal)}).`} />
          )}
          {t.totalCartera === 0 && (
            <InsightBanner type="success" icon="check_circle"
              message="Todos los clientes están al día. Sin cartera pendiente en este período." />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Clientes activos" value={String(data.rows.length)} />
            <StatCard label="Total facturado" value={cop(t.totalFacturado)} />
            <StatCard label="Total cobrado" value={cop(t.totalPagado)} status="success" />
            <StatCard
              label="Cartera pendiente"
              value={cop(t.totalCartera)}
              sub={t.totalFacturado > 0 ? `${Math.round((t.totalCartera / t.totalFacturado) * 100)}% del total facturado` : undefined}
              status={t.totalCartera === 0 ? "success" : t.totalCartera / t.totalFacturado > 0.3 ? "error" : "warning"}
            />
          </div>

          {/* Table */}
          {data.rows.length === 0 ? (
            <EmptyRows />
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Cliente", "Ventas", "Facturado", "% del total", "Pagado", "Cartera", "Riesgo", "Última venta"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map(r => (
                    <tr key={r.clienteId} className="table-row">
                      <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
                      <td className="table-cell">{r.numVentas}</td>
                      <td className="table-cell font-semibold text-[#1c1b1b]">{cop(r.montoTotal)}</td>
                      <td className="table-cell">
                        <span className="badge badge-neutral">{r.participacion}%</span>
                      </td>
                      <td className="table-cell text-[#065f46]">{cop(r.montoPagado)}</td>
                      <td className="table-cell">
                        {r.cartera > 0
                          ? <span className="font-semibold text-[#ba1a1a]">{cop(r.cartera)}</span>
                          : <span className="text-[#4d4635]">—</span>}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${riesgoBadge[r.riesgo]}`}>{r.riesgo}</span>
                      </td>
                      <td className="table-cell text-[#4d4635]">{formatDate(r.ultimaVenta)}</td>
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

function EmptyRows() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 40 }}>group</span>
      <p className="text-sm text-[#7f7663]">Sin clientes con ventas en el período seleccionado.</p>
    </div>
  );
}

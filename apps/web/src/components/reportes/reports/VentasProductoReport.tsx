"use client";
import { useState } from "react";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, toInput, exportCSV } from "../shared/reportUtils";

interface ProductoRow {
  productTypeId: string;
  nombre: string;
  totalKg: number;
  montoTotal: number;
  numVentas: number;
  precioPromedio: number;
  participacion: number;
}
interface ProductoData {
  rows: ProductoRow[];
  totales: { totalKg: number; totalIngresos: number };
}

export function VentasProductoReport() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toInput(today));
  const { data, loading, error, fetchReport } = useReport<ProductoData>();

  const generate = () => fetchReport("ventas-producto", { desde: dateFrom, hasta: dateTo });

  const handleExport = () => {
    if (!data) return;
    exportCSV(
      "ventas_producto",
      ["Producto", "Kg vendidos", "Ingresos", "% del total", "N° ventas", "Precio prom./kg"],
      data.rows.map(r => [r.nombre, r.totalKg, r.montoTotal, r.participacion, r.numVentas, r.precioPromedio])
    );
  };

  const top = data?.rows[0];
  const maxMonto = top?.montoTotal ?? 1;

  return (
    <ReportPanel
      title="Ventas por Producto" desc="Rotación, ingresos y participación por tipo de producto"
      hasDateRange hasAgrupacion={false}
      dateFrom={dateFrom} dateTo={dateTo} agrupacion="dia"
      onDateFromChange={setDateFrom} onDateToChange={setDateTo} onAgrupacionChange={() => {}}
      onGenerate={generate} onExport={handleExport}
      loading={loading} error={error} hasData={!!data}
    >
      {data && (
        <>
          {/* Insight */}
          {top && (
            <InsightBanner type="info" icon="emoji_events"
              message={`"${top.nombre}" lidera con ${top.participacion}% de los ingresos (${cop(top.montoTotal)}).`} />
          )}
          {data.rows.length === 1 && (
            <InsightBanner type="warning" icon="warning"
              message="Solo hay un tipo de producto con ventas. Considera diversificar la oferta para reducir riesgos." />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Productos con ventas" value={String(data.rows.length)} />
            <StatCard label="Total kg vendidos" value={`${data.totales.totalKg.toFixed(1)} kg`} />
            <StatCard label="Ingresos totales" value={cop(data.totales.totalIngresos)} />
          </div>

          {/* Table */}
          {data.rows.length === 0 ? (
            <EmptyRows />
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    {["#", "Producto", "Kg vendidos", "Ingresos", "% del total", "N° ventas", "Precio prom./kg"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr key={r.productTypeId} className="table-row">
                      <td className="table-cell">
                        <span className={`badge ${i === 0 ? "badge-warning" : "badge-neutral"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
                      <td className="table-cell">{r.totalKg} kg</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1c1b1b]">{cop(r.montoTotal)}</span>
                          <div className="h-1.5 rounded-full bg-[#f0eded] flex-1 min-w-[48px]">
                            <div className="h-1.5 rounded-full bg-[#d4af37]" style={{ width: `${(r.montoTotal / maxMonto) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${r.participacion >= 40 ? "badge-success" : r.participacion >= 20 ? "badge-info" : "badge-neutral"}`}>
                          {r.participacion}%
                        </span>
                      </td>
                      <td className="table-cell">{r.numVentas}</td>
                      <td className="table-cell text-[#4d4635]">{cop(r.precioPromedio)}/kg</td>
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
      <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 40 }}>nutrition</span>
      <p className="text-sm text-[#7f7663]">Sin ventas de productos en el período seleccionado.</p>
    </div>
  );
}

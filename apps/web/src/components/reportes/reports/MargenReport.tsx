"use client";
import { useState } from "react";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, toInput, exportCSV } from "../shared/reportUtils";

interface MargenRow {
  productTypeId: string;
  nombre: string;
  kgVendidos: number;
  ingresos: number;
  costoUnitario: number;
  costoTotal: number;
  margenBruto: number;
  margenPct: number;
  participacion: number;
  categoria: "estrella" | "aceptable" | "bajo" | "negativo";
}
interface MargenData {
  rows: MargenRow[];
  totales: { ingresos: number; costoTotal: number; margenBruto: number; margenPct: number };
}

const categoriaBadge = {
  estrella: "badge-success",
  aceptable: "badge-info",
  bajo: "badge-warning",
  negativo: "badge-error",
};

const categoriaLabel = {
  estrella: "Estrella (≥30%)",
  aceptable: "Aceptable (10-29%)",
  bajo: "Bajo (<10%)",
  negativo: "Negativo",
};

export function MargenReport() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toInput(today));
  const { data, loading, error, fetchReport } = useReport<MargenData>();

  const generate = () => fetchReport("margen", { desde: dateFrom, hasta: dateTo });

  const handleExport = () => {
    if (!data) return;
    exportCSV(
      "margen_ganancia",
      ["Producto", "Kg vendidos", "Ingresos", "% participación", "Costo/kg", "Costo total", "Margen bruto", "Margen %", "Categoría"],
      data.rows.map(r => [r.nombre, r.kgVendidos, r.ingresos, r.participacion, r.costoUnitario, r.costoTotal, r.margenBruto, r.margenPct, categoriaLabel[r.categoria]])
    );
  };

  const t = data?.totales;
  const negativos = data?.rows.filter(r => r.categoria === "negativo") ?? [];
  const estrellas = data?.rows.filter(r => r.categoria === "estrella") ?? [];
  const top = data?.rows[0];

  return (
    <ReportPanel
      title="Margen de Ganancia" desc="Rentabilidad bruta por producto: ingresos, costos y margen"
      hasDateRange hasAgrupacion={false}
      dateFrom={dateFrom} dateTo={dateTo} agrupacion="dia"
      onDateFromChange={setDateFrom} onDateToChange={setDateTo} onAgrupacionChange={() => {}}
      onGenerate={generate} onExport={handleExport}
      loading={loading} error={error} hasData={!!data}
    >
      {data && t && (
        <>
          {/* Insights */}
          {negativos.length > 0 && (
            <InsightBanner type="error" icon="trending_down"
              message={`${negativos.length} producto${negativos.length > 1 ? "s" : ""} con margen negativo: ${negativos.map(r => r.nombre).join(", ")}. Estás vendiendo por debajo del costo.`} />
          )}
          {estrellas.length > 0 && negativos.length === 0 && (
            <InsightBanner type="success" icon="stars"
              message={`${estrellas.length} producto${estrellas.length > 1 ? "s" : ""} con margen estrella (≥30%): ${estrellas.map(r => r.nombre).join(", ")}.`} />
          )}
          {top && top.participacion >= 50 && (
            <InsightBanner type="warning" icon="pie_chart"
              message={`"${top.nombre}" concentra el ${top.participacion}% de los ingresos. Alta dependencia de un solo producto.`} />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Ingresos totales" value={cop(t.ingresos)} />
            <StatCard label="Costo total" value={cop(t.costoTotal)} />
            <StatCard label="Margen bruto" value={cop(t.margenBruto)} status={t.margenBruto > 0 ? "success" : "error"} />
            <StatCard
              label="Margen global"
              value={`${t.margenPct}%`}
              sub={t.margenPct >= 30 ? "Saludable" : t.margenPct >= 10 ? "Aceptable" : t.margenPct >= 0 ? "Bajo — revisa costos" : "Negativo — pérdidas"}
              status={t.margenPct >= 30 ? "success" : t.margenPct >= 10 ? undefined : "error"}
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
                    {["Producto", "Kg vendidos", "Ingresos", "% del total", "Costo/kg", "Margen bruto", "Margen %", "Categoría"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map(r => (
                    <tr key={r.productTypeId} className="table-row">
                      <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
                      <td className="table-cell">{r.kgVendidos} kg</td>
                      <td className="table-cell font-semibold text-[#1c1b1b]">{cop(r.ingresos)}</td>
                      <td className="table-cell">
                        <ParticipacionBar pct={r.participacion} />
                      </td>
                      <td className="table-cell text-[#4d4635]">{cop(r.costoUnitario)}/kg</td>
                      <td className="table-cell">
                        <span className={r.margenBruto >= 0 ? "text-[#065f46] font-semibold" : "text-[#ba1a1a] font-semibold"}>
                          {cop(r.margenBruto)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <MargenBar pct={r.margenPct} />
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${categoriaBadge[r.categoria]}`}>{categoriaLabel[r.categoria]}</span>
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

function ParticipacionBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-[#f0eded] w-16">
        <div className="h-1.5 rounded-full bg-[#d4af37]" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-[#4d4635]">{pct}%</span>
    </div>
  );
}

function MargenBar({ pct }: { pct: number }) {
  const color = pct >= 30 ? "bg-[#065f46]" : pct >= 10 ? "bg-[#1d4ed8]" : pct >= 0 ? "bg-[#d97706]" : "bg-[#ba1a1a]";
  const width = Math.min(Math.abs(pct), 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-[#f0eded] w-16">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs font-semibold text-[#1c1b1b]">{pct}%</span>
    </div>
  );
}

function EmptyRows() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 40 }}>analytics</span>
      <p className="text-sm text-[#7f7663]">Sin ventas en el período para calcular margen.</p>
    </div>
  );
}

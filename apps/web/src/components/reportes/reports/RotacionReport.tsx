"use client";
import { useState } from "react";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { toInput } from "../shared/reportUtils";

interface RotRow {
  id: string;
  nombre: string;
  stockActual: number;
  kgVendidos: number;
  kgPorDia: number;
  coberturaDias: number | null;
  rotacion: "alta" | "media" | "baja" | "sin_movimiento";
}
interface RotData { rows: RotRow[]; diasPeriodo: number; }

const ROTACION_BADGE: Record<string, string> = {
  alta: "bg-emerald-100 text-emerald-700",
  media: "bg-[#d4af37]/20 text-[#735c00]",
  baja: "bg-amber-50 text-amber-700",
  sin_movimiento: "bg-[#f0eded] text-[#7f7663]",
};
const ROTACION_LABEL: Record<string, string> = {
  alta: "Alta", media: "Media", baja: "Baja", sin_movimiento: "Sin movimiento",
};

export function RotacionReport() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toInput(today));
  const { data, loading, error, fetchReport } = useReport<RotData>();

  const generate = () => fetchReport("rotacion", { desde: dateFrom, hasta: dateTo });

  const alta = data?.rows.filter(r => r.rotacion === "alta").length ?? 0;
  const sinMovimiento = data?.rows.filter(r => r.rotacion === "sin_movimiento") ?? [];
  const top = data?.rows[0];

  return (
    <ReportPanel
      title="Rotación de Productos" desc="Velocidad de venta, cobertura de stock y clasificación por movimiento"
      hasDateRange hasAgrupacion={false}
      dateFrom={dateFrom} dateTo={dateTo} agrupacion="dia"
      onDateFromChange={setDateFrom} onDateToChange={setDateTo} onAgrupacionChange={() => {}}
      onGenerate={generate} onExport={() => {}}
      loading={loading} error={error} hasData={!!data}
    >
      {data && (
        <>
          {top && (
            <InsightBanner type="info" icon="local_fire_department"
              message={`"${top.nombre}" es el producto de mayor rotación: ${top.kgPorDia.toFixed(2)} kg/día.`} />
          )}
          {sinMovimiento.length > 0 && (
            <InsightBanner type="warning" icon="warning"
              message={`${sinMovimiento.length} producto(s) sin ventas en el período: ${sinMovimiento.map(r => r.nombre).join(", ")}.`} />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Productos totales" value={String(data.rows.length)} />
            <StatCard label="Rotación alta" value={String(alta)} />
            <StatCard label="Sin movimiento" value={String(sinMovimiento.length)} />
            <StatCard label="Período analizado" value={`${data.diasPeriodo} días`} />
          </div>

          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  {["Producto", "Stock actual", "Kg vendidos", "Kg / día", "Cobertura", "Rotación"].map(h => (
                    <th key={h} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
                    <td className="table-cell">{r.stockActual} kg</td>
                    <td className="table-cell">{r.kgVendidos} kg</td>
                    <td className="table-cell text-[#4d4635]">{r.kgPorDia.toFixed(2)} kg/día</td>
                    <td className="table-cell">
                      {r.coberturaDias !== null ? (
                        <span className={`font-semibold ${r.coberturaDias < 7 ? "text-[#ba1a1a]" : r.coberturaDias < 15 ? "text-amber-600" : "text-emerald-700"}`}>
                          {r.coberturaDias} días
                        </span>
                      ) : <span className="text-[#7f7663] italic text-xs">—</span>}
                    </td>
                    <td className="table-cell">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ROTACION_BADGE[r.rotacion]}`}>
                        {ROTACION_LABEL[r.rotacion]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ReportPanel>
  );
}

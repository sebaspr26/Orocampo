"use client";
import { useState } from "react";
import { useReport } from "../hooks/useReport";
import { ReportPanel } from "../shared/ReportPanel";
import { StatCard } from "../shared/StatCard";
import { InsightBanner } from "../shared/InsightBanner";
import { cop, toInput } from "../shared/reportUtils";

interface DevRow { productTypeId: string; nombre: string; totalKg: number; numDevoluciones: number; numClientes: number; }
interface DevData {
  rows: DevRow[];
  totalDevoluciones: number;
  totalKgDevuelto: number;
  porRazon: { CLIENTE_RECHAZO: number; VENCIDO: number; MAL_ESTADO: number; EXCESO: number; };
}

export function DevolucionesReport() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toInput(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(toInput(today));
  const { data, loading, error, fetchReport } = useReport<DevData>();

  const generate = () => fetchReport("devoluciones", { desde: dateFrom, hasta: dateTo });

  const maxKg = data?.rows[0]?.totalKg ?? 1;

  return (
    <ReportPanel
      title="Pérdidas y Devoluciones" desc="Productos devueltos por clientes en el período seleccionado"
      hasDateRange hasAgrupacion={false}
      dateFrom={dateFrom} dateTo={dateTo} agrupacion="dia"
      onDateFromChange={setDateFrom} onDateToChange={setDateTo} onAgrupacionChange={() => {}}
      onGenerate={generate} onExport={() => {}}
      loading={loading} error={error} hasData={!!data}
    >
      {data && (
        <>
          {data.totalDevoluciones === 0 && (
            <InsightBanner type="success" icon="check_circle" message="Sin devoluciones en el período seleccionado." />
          )}
          {data.totalKgDevuelto > 50 && (
            <InsightBanner type="warning" icon="warning" message={`Alto volumen de devoluciones: ${data.totalKgDevuelto} kg en el período. Revisar calidad y logística.`} />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total devoluciones" value={String(data.totalDevoluciones)} />
            <StatCard label="Kg devueltos" value={`${data.totalKgDevuelto} kg`} />
            <StatCard label="Por vencimiento" value={`${data.porRazon.VENCIDO} kg`} />
            <StatCard label="Por mal estado" value={`${data.porRazon.MAL_ESTADO} kg`} />
          </div>

          {/* Desglose por razón */}
          <div className="bg-[#f6f3f2] rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-3">Kg por razón</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Rechazo cliente", val: data.porRazon.CLIENTE_RECHAZO, color: "bg-amber-400" },
                { label: "Vencido", val: data.porRazon.VENCIDO, color: "bg-[#ba1a1a]" },
                { label: "Mal estado", val: data.porRazon.MAL_ESTADO, color: "bg-orange-500" },
                { label: "Exceso pedido", val: data.porRazon.EXCESO, color: "bg-[#7f7663]" },
              ].map(r => (
                <div key={r.label} className="bg-white rounded-xl p-3">
                  <div className={`w-2 h-2 rounded-full ${r.color} mb-2`} />
                  <p className="text-xs text-[#7f7663]">{r.label}</p>
                  <p className="font-bold text-[#1c1b1b]">{r.val} kg</p>
                </div>
              ))}
            </div>
          </div>

          {data.rows.length > 0 && (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Producto", "Kg devueltos", "N° devoluciones", "Clientes afectados"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map(r => (
                    <tr key={r.productTypeId} className="table-row">
                      <td className="table-cell font-semibold text-[#1c1b1b]">{r.nombre}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{r.totalKg} kg</span>
                          <div className="h-1.5 rounded-full bg-[#f0eded] flex-1 min-w-[48px]">
                            <div className="h-1.5 rounded-full bg-[#ba1a1a]" style={{ width: `${(r.totalKg / maxKg) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{r.numDevoluciones}</td>
                      <td className="table-cell">{r.numClientes}</td>
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

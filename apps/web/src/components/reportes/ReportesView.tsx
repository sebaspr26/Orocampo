"use client";
import { useState } from "react";
import { VentasPeriodoReport } from "./reports/VentasPeriodoReport";
import { VentasProductoReport } from "./reports/VentasProductoReport";
import { VentasClienteReport } from "./reports/VentasClienteReport";
import { CarteraReport } from "./reports/CarteraReport";
import { InventarioReport } from "./reports/InventarioReport";
import { MargenReport } from "./reports/MargenReport";
import { DevolucionesReport } from "./reports/DevolucionesReport";
import { RotacionReport } from "./reports/RotacionReport";

type ReportId = "ventas-periodo" | "ventas-producto" | "ventas-cliente" | "cartera" | "inventario" | "margen" | "devoluciones" | "rotacion";

interface ReportMeta {
  id: ReportId;
  title: string;
  desc: string;
  icon: string;
}

const REPORTS: ReportMeta[] = [
  { id: "ventas-periodo",  title: "Ventas por Período",      desc: "Evolución de ventas, cobros y anulaciones",    icon: "trending_up"       },
  { id: "ventas-producto", title: "Ventas por Producto",     desc: "Ingresos y participación por tipo de queso",   icon: "nutrition"         },
  { id: "ventas-cliente",  title: "Ventas por Cliente",      desc: "Facturación, cobros y riesgo de cartera",      icon: "group"             },
  { id: "cartera",         title: "Cartera y Cobros",        desc: "Deuda pendiente por antigüedad y urgencia",    icon: "account_balance"   },
  { id: "inventario",      title: "Inventario y Vencimientos",desc: "Stock, cobertura en días y vencimientos",     icon: "inventory_2"       },
  { id: "margen",          title: "Margen de Ganancia",      desc: "Rentabilidad bruta y categoría por producto",  icon: "analytics"         },
  { id: "rotacion",        title: "Rotación de Productos",   desc: "Velocidad de venta y cobertura de stock",      icon: "autorenew"         },
  { id: "devoluciones",    title: "Pérdidas y Devoluciones", desc: "Productos devueltos, vencidos y mal estado",   icon: "assignment_return" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REPORT_COMPONENTS: Record<ReportId, () => any> = {
  "ventas-periodo":  VentasPeriodoReport,
  "ventas-producto": VentasProductoReport,
  "ventas-cliente":  VentasClienteReport,
  "cartera":         CarteraReport,
  "inventario":      InventarioReport,
  "margen":          MargenReport,
  "rotacion":        RotacionReport,
  "devoluciones":    DevolucionesReport,
};

export default function ReportesView() {
  const [selected, setSelected] = useState<ReportId | null>(null);
  const ActiveReport = selected ? REPORT_COMPONENTS[selected] : null;

  return (
    <div className="space-y-8">
      <section>
        <span className="page-eyebrow">Análisis de datos</span>
        <h2 className="page-title mt-1">Reportes y Analítica</h2>
        <p className="page-subtitle mt-2">Selecciona un reporte para ver datos detallados con indicadores y alertas.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORTS.map(r => {
          const isSelected = selected === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(isSelected ? null : r.id)}
              className={`text-left rounded-[2rem] p-6 transition-all group border ${
                isSelected ? "card-gold border-transparent" : "card border-transparent hover:border-[#d4af37]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isSelected ? "bg-white/20" : "bg-[#d4af37]/10"}`}>
                <span
                  className={`material-symbols-outlined text-[20px] ${isSelected ? "text-white" : "text-[#735c00]"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {r.icon}
                </span>
              </div>
              <p className={`font-bold text-sm ${isSelected ? "text-white" : "text-[#1c1b1b]"}`}>{r.title}</p>
              <p className={`text-xs mt-1 ${isSelected ? "text-white/75" : "text-[#7f7663]"}`}>{r.desc}</p>
              <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${isSelected ? "text-white/90" : "text-[#735c00]"}`}>
                <span>{isSelected ? "Seleccionado" : "Ver reporte"}</span>
                <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                  {isSelected ? "expand_less" : "arrow_forward"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {ActiveReport && <ActiveReport key={selected!} />}
    </div>
  );
}

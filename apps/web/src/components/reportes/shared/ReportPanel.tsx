"use client";
import { toInput } from "./reportUtils";

type Agrupacion = "dia" | "semana" | "mes";

interface ReportPanelProps {
  title: string;
  desc: string;
  hasDateRange: boolean;
  hasAgrupacion: boolean;
  dateFrom: string;
  dateTo: string;
  agrupacion: Agrupacion;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onAgrupacionChange: (v: Agrupacion) => void;
  onGenerate: () => void;
  onExport?: () => void;
  loading: boolean;
  error: string | null;
  hasData: boolean;
  children: React.ReactNode;
}

export function ReportPanel({
  title, desc, hasDateRange, hasAgrupacion, dateFrom, dateTo, agrupacion,
  onDateFromChange, onDateToChange, onAgrupacionChange, onGenerate, onExport,
  loading, error, hasData, children,
}: ReportPanelProps) {
  const today = toInput(new Date());

  return (
    <div className="card p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="page-eyebrow">{title}</span>
          <h3 className="text-xl font-extrabold tracking-tight text-[#1c1b1b] mt-1">{desc}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasData && onExport && (
            <button onClick={onExport} className="btn btn-secondary btn-sm">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Exportar CSV
            </button>
          )}
          {hasDateRange && (
            <button onClick={onGenerate} disabled={loading} className="btn btn-primary btn-sm">
              {loading
                ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-[16px]">play_arrow</span>}
              {loading ? "Cargando..." : hasData || error ? "Actualizar" : "Generar"}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {(hasDateRange || hasAgrupacion) && (
        <div className="flex flex-wrap items-end gap-4 pb-2 border-b border-[#f0eded]">
          {hasDateRange && (
            <>
              <div>
                <label className="input-label">Desde</label>
                <input type="date" className="input w-40" max={today} value={dateFrom} onChange={e => onDateFromChange(e.target.value)} />
              </div>
              <div>
                <label className="input-label">Hasta</label>
                <input type="date" className="input w-40" max={today} value={dateTo} onChange={e => onDateToChange(e.target.value)} />
              </div>
            </>
          )}
          {hasAgrupacion && (
            <div>
              <label className="input-label">Agrupación</label>
              <select className="input w-36" value={agrupacion} onChange={e => onAgrupacionChange(e.target.value as Agrupacion)}>
                <option value="dia">Diaria</option>
                <option value="semana">Semanal</option>
                <option value="mes">Mensual</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-[#7f7663]">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span className="text-sm">Procesando datos...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 bg-[#ffdad6] text-[#93000a] rounded-2xl px-5 py-4 text-sm font-medium">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          {error}
        </div>
      )}

      {/* Empty prompt */}
      {!loading && !error && !hasData && hasDateRange && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <span className="material-symbols-outlined text-[#d0c5af]" style={{ fontSize: 48 }}>insert_chart</span>
          <p className="text-sm text-[#7f7663]">Configura el período y haz clic en <strong>Generar</strong>.</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && hasData && (
        <div className="space-y-5">{children}</div>
      )}
    </div>
  );
}

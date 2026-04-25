"use client";
import { useState } from "react";

interface Preview {
  fecha: string;
  totalEfectivo: number;
  totalTransferencia: number;
  totalCobrado: number;
  numeroPagos: number;
  carteraPendiente: number;
}

interface CorteCaja {
  id: string;
  fecha: string;
  totalEfectivo: number;
  totalTransferencia: number;
  montoDeclarado?: number | null;
  diferencia?: number | null;
  notas?: string | null;
  estado: string;
  createdAt: string;
}

interface Props {
  preview: Preview | null;
  onClose: () => void;
  onSaved: (corte: CorteCaja) => void;
}

export default function ArqueoModal({ preview, onClose, onSaved }: Props) {
  const [montoDeclarado, setMontoDeclarado] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  const declarado = montoDeclarado ? parseFloat(montoDeclarado) : null;
  const diferencia = declarado !== null && preview ? preview.totalEfectivo - declarado : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/caja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montoDeclarado: declarado,
          notas: notas || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.corte);
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  const inputClass = "w-full px-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>Arqueo de caja</h3>
            <p className="text-sm text-[#7f7663] mt-1">Declara el dinero en físico para cerrar el día</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#7f7663] hover:bg-[#eae7e7] transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>{error}
            </div>
          )}

          {preview && (
            <div className="bg-[#f6f3f2] rounded-2xl p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-3">Resumen del sistema</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#4d4635]">Efectivo registrado</span>
                <span className="font-bold text-[#735c00]">{fmt(preview.totalEfectivo)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4d4635]">Transferencias</span>
                <span className="font-semibold">{fmt(preview.totalTransferencia)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#eae7e7] pt-2 mt-2">
                <span className="font-semibold">Total cobrado</span>
                <span className="font-bold">{fmt(preview.totalCobrado)}</span>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Efectivo contado físicamente</label>
            <input type="number" min="0" step="100" value={montoDeclarado}
              onChange={e => setMontoDeclarado(e.target.value)}
              placeholder="0" className={inputClass} />
            <p className="text-xs text-[#7f7663] mt-1">Deja en blanco si no realizas arqueo físico</p>
          </div>

          {diferencia !== null && preview && (
            <div className={`rounded-2xl p-4 flex items-center justify-between ${Math.abs(diferencia) === 0 ? "bg-emerald-50 border border-emerald-100" : "bg-[#ffdad6] border border-[#ba1a1a]/10"}`}>
              <span className={`text-sm font-bold ${Math.abs(diferencia) === 0 ? "text-emerald-700" : "text-[#ba1a1a]"}`}>
                {Math.abs(diferencia) === 0 ? "Caja cuadrada" : diferencia > 0 ? "Faltante" : "Sobrante"}
              </span>
              <span className={`text-xl font-black ${Math.abs(diferencia) === 0 ? "text-emerald-700" : "text-[#ba1a1a]"}`}>
                {Math.abs(diferencia) === 0 ? "OK" : fmt(Math.abs(diferencia))}
              </span>
            </div>
          )}

          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Notas del cierre..." rows={2}
              className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Registrando..." : "Cerrar caja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

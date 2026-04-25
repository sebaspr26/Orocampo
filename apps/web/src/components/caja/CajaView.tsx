"use client";
import { useState } from "react";
import ArqueoModal from "./ArqueoModal";

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

interface Preview {
  fecha: string;
  totalEfectivo: number;
  totalTransferencia: number;
  totalCobrado: number;
  numeroPagos: number;
  carteraPendiente: number;
}

interface Props {
  initialCortes: CorteCaja[];
}

export default function CajaView({ initialCortes }: Props) {
  const [cortes, setCortes] = useState<CorteCaja[]>(initialCortes);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [arqueoOpen, setArqueoOpen] = useState(false);

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  async function loadPreview() {
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/caja?preview=1");
      const data = await res.json();
      setPreview(data);
    } finally { setLoadingPreview(false); }
  }

  function handleSaved(corte: CorteCaja) {
    setCortes(prev => [corte, ...prev]);
    setArqueoOpen(false);
    setPreview(null);
  }

  const ultimoCorte = cortes[0];
  const totalEfectivoTotal = cortes.reduce((s, c) => s + c.totalEfectivo, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#d4af37]/20 relative overflow-hidden">
          <p className="text-white/80 text-sm">Último cierre</p>
          <h3 className="text-2xl font-black mt-2 tracking-tighter">
            {ultimoCorte ? fmt(ultimoCorte.totalEfectivo + ultimoCorte.totalTransferencia) : "—"}
          </h3>
          {ultimoCorte && (
            <p className="text-white/70 text-xs mt-1">{fmtDate(ultimoCorte.fecha)}</p>
          )}
          <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-white/5">point_of_sale</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Efectivo acumulado (histórico)</p>
          <h3 className="text-3xl font-bold mt-1">{fmt(totalEfectivoTotal)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Cortes registrados</p>
          <h3 className="text-3xl font-bold mt-1">{cortes.length}</h3>
          <p className="text-xs text-[#7f7663] mt-1">
            {cortes.filter(c => c.diferencia && Math.abs(c.diferencia) > 0).length} con descuadre
          </p>
        </div>
      </div>

      {/* Preview del día actual */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h4 className="text-xl font-bold">Corte de hoy</h4>
            <p className="text-sm text-[#7f7663] mt-1">Resumen de pagos recibidos en el día</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadPreview} disabled={loadingPreview}
              className="flex items-center gap-2 border border-[#eae7e7] text-[#735c00] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#f6f3f2] transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-lg">refresh</span>
              {loadingPreview ? "Calculando..." : "Calcular"}
            </button>
            <button onClick={() => { loadPreview(); setArqueoOpen(true); }}
              className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">lock</span>Cerrar caja
            </button>
          </div>
        </div>

        {preview ? (
          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#f6f3f2] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Efectivo</p>
              <p className="text-2xl font-black text-[#735c00] mt-1">{fmt(preview.totalEfectivo)}</p>
            </div>
            <div className="bg-[#f6f3f2] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Transferencias</p>
              <p className="text-2xl font-black text-[#1c1b1b] mt-1">{fmt(preview.totalTransferencia)}</p>
            </div>
            <div className="bg-[#f6f3f2] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Total cobrado</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{fmt(preview.totalCobrado)}</p>
            </div>
            <div className="bg-[#ffdad6] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ba1a1a]">Cartera pendiente</p>
              <p className="text-2xl font-black text-[#ba1a1a] mt-1">{fmt(preview.carteraPendiente)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-[#7f7663] text-sm">
            Haz clic en &quot;Calcular&quot; para ver el resumen del día.
          </div>
        )}
      </div>

      {/* Historial de cortes */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#f0eded]">
          <h4 className="text-xl font-bold">Historial de cierres</h4>
        </div>

        {cortes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#735c00] text-3xl">point_of_sale</span>
            </div>
            <h5 className="font-bold text-[#1c1b1b] mb-2">Sin cierres registrados</h5>
            <p className="text-sm text-[#7f7663]">Realiza el primer cierre de caja del día.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 text-left font-bold">Fecha</th>
                  <th className="px-6 py-4 text-right font-bold">Efectivo</th>
                  <th className="px-6 py-4 text-right font-bold">Transferencia</th>
                  <th className="px-6 py-4 text-right font-bold">Total cobrado</th>
                  <th className="px-6 py-4 text-right font-bold">Declarado</th>
                  <th className="px-6 py-4 text-right font-bold">Diferencia</th>
                  <th className="px-6 py-4 text-left font-bold">Notas</th>
                </tr>
              </thead>
              <tbody>
                {cortes.map(c => {
                  const total = c.totalEfectivo + c.totalTransferencia;
                  const diff = c.diferencia;
                  return (
                    <tr key={c.id} className="border-t border-[#f0eded] hover:bg-[#fafaf9] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1c1b1b]">{fmtDate(c.fecha)}</td>
                      <td className="px-6 py-4 text-right text-[#4d4635]">{fmt(c.totalEfectivo)}</td>
                      <td className="px-6 py-4 text-right text-[#4d4635]">{fmt(c.totalTransferencia)}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#735c00]">{fmt(total)}</td>
                      <td className="px-6 py-4 text-right text-[#4d4635]">
                        {c.montoDeclarado !== null && c.montoDeclarado !== undefined ? fmt(c.montoDeclarado) : <span className="text-[#7f7663] italic">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {diff !== null && diff !== undefined ? (
                          <span className={`font-bold text-xs px-2 py-1 rounded-full ${Math.abs(diff) === 0 ? "bg-emerald-100 text-emerald-700" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>
                            {diff === 0 ? "Cuadra" : `${diff > 0 ? "Falta" : "Sobra"} ${fmt(Math.abs(diff))}`}
                          </span>
                        ) : <span className="text-[#7f7663] italic text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-[#7f7663] text-xs max-w-[150px] truncate">{c.notas ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {arqueoOpen && (
        <ArqueoModal
          preview={preview}
          onClose={() => setArqueoOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import PagoFormModal from "./PagoFormModal";

interface Cliente { id: string; nombre: string; }
interface VentaRef { id: string; total: number; cliente: { nombre: string }; }

interface Pago {
  id: string;
  clienteId: string;
  cliente: { id: string; nombre: string };
  ventaId?: string | null;
  venta?: { id: string; total: number } | null;
  monto: number;
  metodoPago: string;
  fecha: string;
  notas?: string | null;
}

interface Props {
  initialPagos: Pago[];
  clientes: Cliente[];
  ventas: VentaRef[];
  resumen: { totalHoy: number; efectivoHoy: number; transferenciaHoy: number; carteraPendiente: number };
}

export default function PagosView({ initialPagos, clientes, ventas, resumen }: Props) {
  const [pagos, setPagos] = useState<Pago[]>(initialPagos);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = pagos.filter(p =>
    p.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  function handleSaved(saved: Pago) {
    setPagos(prev => [saved, ...prev]);
    setModalOpen(false);
  }

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const metodoBadge = (m: string) => m === "EFECTIVO" ? "bg-[#d4af37]/20 text-[#735c00]" : "bg-blue-50 text-blue-700";

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#d4af37]/20 relative overflow-hidden">
          <p className="text-white/80 text-sm">Cobrado Hoy</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter">{fmt(resumen.totalHoy)}</h3>
          <div className="flex items-center gap-3 mt-3 bg-white/10 w-fit px-3 py-1 rounded-full text-white/80 text-xs font-bold">
            <span>{fmt(resumen.efectivoHoy)} efectivo</span>
            <span>·</span>
            <span>{fmt(resumen.transferenciaHoy)} transferencia</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Cartera Pendiente</p>
          <h3 className={`text-3xl font-bold mt-1 ${resumen.carteraPendiente > 0 ? "text-[#ba1a1a]" : "text-[#1c1b1b]"}`}>{fmt(resumen.carteraPendiente)}</h3>
          <p className="text-[11px] text-[#1c1b1b]/40 mt-2 font-semibold">Por cobrar</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Total pagos registrados</p>
          <h3 className="text-3xl font-bold mt-1">{pagos.length}</h3>
          <div className="mt-4 h-1 bg-[#f6f3f2] rounded-full overflow-hidden">
            <div className="h-full bg-[#d4af37]" style={{ width: pagos.length > 0 ? "100%" : "0%" }}></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <h4 className="text-xl font-bold">Historial de Pagos</h4>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="bg-[#f6f3f2] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-48"
                placeholder="Buscar pago..." />
            </div>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">add</span>Registrar
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#735c00] text-3xl">payments</span>
            </div>
            <h5 className="font-bold text-[#1c1b1b] mb-2">{search ? "Sin resultados" : "Sin pagos registrados"}</h5>
            {!search && (
              <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-[#735c00] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all mx-auto mt-4">
                <span className="material-symbols-outlined text-lg">add</span>Registrar Pago
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 text-left font-bold">Recibo</th>
                  <th className="px-6 py-4 text-left font-bold">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold">Factura</th>
                  <th className="px-6 py-4 text-left font-bold">Método</th>
                  <th className="px-6 py-4 text-right font-bold">Monto</th>
                  <th className="px-6 py-4 text-left font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-[#f0eded] hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-[#7f7663] bg-[#f6f3f2] px-2 py-1 rounded-lg">#{p.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1c1b1b]">{p.cliente.nombre}</td>
                    <td className="px-6 py-4 text-[#7f7663] text-xs">
                      {p.ventaId ? `#${p.ventaId.slice(-8).toUpperCase()}` : <span className="italic">Abono general</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${metodoBadge(p.metodoPago)}`}>{p.metodoPago}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">{fmt(p.monto)}</td>
                    <td className="px-6 py-4 text-[#7f7663] text-xs">{fmtDate(p.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && <PagoFormModal clientes={clientes} ventas={ventas} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
    </>
  );
}

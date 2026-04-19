"use client";
import { useState } from "react";

interface Cliente { id: string; nombre: string; }
interface Venta { id: string; total: number; cliente: { nombre: string }; }

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
  clientes: Cliente[];
  ventas: Venta[];
  onClose: () => void;
  onSaved: (pago: Pago) => void;
}

export default function PagoFormModal({ clientes, ventas, onClose, onSaved }: Props) {
  const [clienteId, setClienteId] = useState("");
  const [ventaId, setVentaId] = useState("");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ventasDelCliente = ventas.filter(v => v.cliente.nombre && clientes.find(c => c.id === clienteId)?.nombre === v.cliente.nombre);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!clienteId) { setError("Selecciona un cliente"); return; }
    if (!monto || parseFloat(monto) <= 0) { setError("Ingresa un monto válido"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, ventaId: ventaId || undefined, monto: parseFloat(monto), metodoPago, notas }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.pago);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full pl-4 pr-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";
  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Registrar Pago</h3>
            <p className="text-sm text-[#7f7663] mt-1">Registra el pago recibido de un cliente</p>
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
          <div>
            <label className={labelClass}>Cliente *</label>
            <select value={clienteId} onChange={e => { setClienteId(e.target.value); setVentaId(""); }} required className={`${inputClass} bg-[#f6f3f2]`}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          {clienteId && ventasDelCliente.length > 0 && (
            <div>
              <label className={labelClass}>Factura (opcional)</label>
              <select value={ventaId} onChange={e => setVentaId(e.target.value)} className={`${inputClass} bg-[#f6f3f2]`}>
                <option value="">Abono general (sin factura específica)</option>
                {ventasDelCliente.map(v => (
                  <option key={v.id} value={v.id}>Factura #{v.id.slice(-8).toUpperCase()} — {fmt(v.total)}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Monto *</label>
              <input type="number" min="1" step="100" value={monto} onChange={e => setMonto(e.target.value)} required placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Método *</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className={`${inputClass} bg-[#f6f3f2]`}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones del pago..." rows={2} className={`${inputClass} resize-none`} />
          </div>
          {monto && parseFloat(monto) > 0 && (
            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100">
              <span className="text-sm font-bold text-emerald-700">Monto a registrar</span>
              <span className="text-xl font-black text-emerald-700">{fmt(parseFloat(monto))}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

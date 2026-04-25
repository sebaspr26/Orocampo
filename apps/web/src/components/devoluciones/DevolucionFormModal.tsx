"use client";
import { useState } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface Cliente { id: string; nombre: string; }
interface Venta { id: string; total: number; cliente: { nombre: string }; estado: string; }
interface ProductType { id: string; name: string; }

interface DevolucionItem { productTypeId: string; cantidadKg: number; razon: string; }

interface Props {
  clientes: Cliente[];
  ventas: Venta[];
  productTypes: ProductType[];
  onClose: () => void;
  onSaved: (d: unknown) => void;
}

const RAZONES = [
  { value: "CLIENTE_RECHAZO", label: "Rechazo del cliente" },
  { value: "VENCIDO", label: "Producto vencido" },
  { value: "MAL_ESTADO", label: "Mal estado" },
  { value: "EXCESO", label: "Exceso de pedido" },
];

export default function DevolucionFormModal({ clientes, ventas, productTypes, onClose, onSaved }: Props) {
  const [clienteId, setClienteId] = useState("");
  const [ventaId, setVentaId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [items, setItems] = useState<DevolucionItem[]>([{ productTypeId: "", cantidadKg: 0, razon: "CLIENTE_RECHAZO" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ventasCliente = ventas.filter(v => {
    const c = clientes.find(c => c.id === clienteId);
    return c && v.cliente.nombre === c.nombre && v.estado !== "ANULADA";
  });

  function addItem() {
    setItems(prev => [...prev, { productTypeId: "", cantidadKg: 0, razon: "CLIENTE_RECHAZO" }]);
  }
  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, field: keyof DevolucionItem, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!clienteId) { setError("Selecciona un cliente"); return; }
    if (!motivo.trim()) { setError("Ingresa el motivo"); return; }
    if (items.some(i => !i.productTypeId || i.cantidadKg <= 0)) { setError("Completa todos los productos"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/devoluciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, ventaId: ventaId || undefined, motivo, items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.devolucion);
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  const inputClass = "w-full px-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded] sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>Registrar Devolución</h3>
            <p className="text-sm text-[#7f7663] mt-1">Registra productos devueltos por el cliente</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>Cliente *</label>
              <SearchableSelect
                options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
                value={clienteId}
                onChange={v => { setClienteId(v); setVentaId(""); }}
                placeholder="Seleccionar cliente..."
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>Factura de origen (opcional)</label>
              <select value={ventaId} onChange={e => setVentaId(e.target.value)} className={inputClass} disabled={!clienteId}>
                <option value="">Sin factura específica</option>
                {ventasCliente.map(v => (
                  <option key={v.id} value={v.id}>#{v.id.slice(-8).toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Motivo general *</label>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} required rows={2}
              placeholder="Describe el motivo de la devolución..."
              className={`${inputClass} resize-none`} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelClass + " mb-0"}>Productos devueltos *</label>
              <button type="button" onClick={addItem}
                className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>Agregar producto
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-[#f6f3f2] rounded-2xl p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 md:col-span-1">
                      <label className={labelClass}>Producto</label>
                      <select value={item.productTypeId}
                        onChange={e => updateItem(i, "productTypeId", e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl text-sm border-none focus:outline-none focus:ring-1 focus:ring-[#d4af37]">
                        <option value="">Seleccionar...</option>
                        {productTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Cantidad (kg)</label>
                      <input type="number" min="0.1" step="0.1"
                        value={item.cantidadKg || ""}
                        onChange={e => updateItem(i, "cantidadKg", parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white rounded-xl text-sm border-none focus:outline-none focus:ring-1 focus:ring-[#d4af37]" />
                    </div>
                    <div>
                      <label className={labelClass}>Razón</label>
                      <select value={item.razon}
                        onChange={e => updateItem(i, "razon", e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl text-sm border-none focus:outline-none focus:ring-1 focus:ring-[#d4af37]">
                        {RAZONES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      className="self-end text-xs text-[#ba1a1a] hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">delete</span>Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Registrando..." : "Registrar Devolución"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface Cliente { id: string; nombre: string; }
interface ProductType { id: string; name: string; }
interface ItemForm { productTypeId: string; cantidadKg: number; precioUnitario: number; }

interface Venta {
  id: string;
  clienteId: string;
  cliente: { id: string; nombre: string };
  fecha: string;
  metodoPago: string;
  estado: string;
  total: number;
  notas?: string | null;
  items: { id: string; productTypeId: string; productType: { id: string; name: string }; cantidadKg: number; precioUnitario: number; subtotal: number }[];
  totalPagado: number;
}

interface Props {
  clientes: Cliente[];
  productTypes: ProductType[];
  onClose: () => void;
  onSaved: (venta: Venta) => void;
}

export default function VentaFormModal({ clientes, productTypes, onClose, onSaved }: Props) {
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemForm[]>([{ productTypeId: "", cantidadKg: 0, precioUnitario: 0 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, i) => sum + i.cantidadKg * i.precioUnitario, 0);

  function addItem() { setItems(prev => [...prev, { productTypeId: "", cantidadKg: 0, precioUnitario: 0 }]); }
  function removeItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)); }
  function updateItem(idx: number, field: keyof ItemForm, value: string | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!clienteId) { setError("Selecciona un cliente"); return; }
    if (items.some(i => !i.productTypeId || i.cantidadKg <= 0 || i.precioUnitario <= 0)) {
      setError("Completa todos los ítems correctamente"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, metodoPago, notas, items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.venta);
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
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Nueva Venta</h3>
            <p className="text-sm text-[#7f7663] mt-1">Registra una venta y genera la factura</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#7f7663] hover:bg-[#eae7e7] transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cliente *</label>
              <SearchableSelect
                options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
                value={clienteId}
                onChange={setClienteId}
                placeholder="Seleccionar cliente..."
                required
              />
            </div>
            <div>
              <label className={labelClass}>Método de Pago *</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className={`${inputClass} bg-[#f6f3f2]`}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CREDITO">Crédito (fiado)</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelClass}>Productos *</label>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-[#735c00] text-xs font-bold hover:underline">
                <span className="material-symbols-outlined text-sm">add</span>Agregar ítem
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-[#f6f3f2] rounded-2xl p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 md:col-span-1">
                      <select
                        value={item.productTypeId}
                        onChange={e => updateItem(idx, "productTypeId", e.target.value)}
                        required
                        className="w-full px-3 py-2.5 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                      >
                        <option value="">Tipo de queso...</option>
                        {productTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number" min="0.1" step="0.1"
                        value={item.cantidadKg || ""}
                        onChange={e => updateItem(idx, "cantidadKg", parseFloat(e.target.value) || 0)}
                        placeholder="Kg"
                        className="w-full px-3 py-2.5 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number" min="0" step="100"
                        value={item.precioUnitario || ""}
                        onChange={e => updateItem(idx, "precioUnitario", parseFloat(e.target.value) || 0)}
                        placeholder="$/kg"
                        className="flex-1 w-full px-3 py-2.5 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                      />
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-colors shrink-0">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {item.cantidadKg > 0 && item.precioUnitario > 0 && (
                    <div className="text-right text-xs font-bold text-[#735c00]">
                      Subtotal: {fmt(item.cantidadKg * item.precioUnitario)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones de la venta..." rows={2} className={`${inputClass} resize-none`} />
          </div>

          {/* Total */}
          <div className="bg-[#d4af37]/10 rounded-2xl p-5 flex items-center justify-between">
            <span className="text-sm font-bold text-[#735c00]">Total de la venta</span>
            <span className="text-2xl font-black text-[#735c00]">{fmt(total)}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || total === 0} className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Registrando..." : `Registrar Venta · ${fmt(total)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

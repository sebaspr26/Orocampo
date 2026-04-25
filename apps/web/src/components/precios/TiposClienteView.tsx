"use client";
import { useState } from "react";

interface ProductType { id: string; name: string; }
interface PrecioTipo { id: string; productTypeId: string; productType: { id: string; name: string }; precio: number; }

interface TipoCliente {
  id: string;
  nombre: string;
  descripcion?: string | null;
  isActive: boolean;
  precios: PrecioTipo[];
  _count: { clientes: number };
}

interface Props {
  initialTipos: TipoCliente[];
  productTypes: ProductType[];
}

const inputClass = "w-full px-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";
const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

function TipoModal({ tipo, productTypes, onClose, onSaved }: {
  tipo: TipoCliente | null;
  productTypes: ProductType[];
  onClose: () => void;
  onSaved: (t: TipoCliente) => void;
}) {
  const isEdit = !!tipo;
  const [nombre, setNombre] = useState(tipo?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(tipo?.descripcion ?? "");
  const [precios, setPrecios] = useState<Record<string, string>>(
    Object.fromEntries((tipo?.precios ?? []).map(p => [p.productTypeId, String(p.precio)]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isEdit ? `/api/tipos-cliente/${tipo.id}` : "/api/tipos-cliente";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }

      const tipoId = data.tipo.id;
      const savedPrecios = await Promise.all(
        Object.entries(precios)
          .filter(([, v]) => v && !isNaN(parseFloat(v)))
          .map(([productTypeId, precioStr]) =>
            fetch(`/api/tipos-cliente/${tipoId}/precios`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productTypeId, precio: parseFloat(precioStr) }),
            }).then(r => r.json()).then(d => d.precio as PrecioTipo)
          )
      );
      // Merge: new/updated prices override stale ones from the tipo response
      const preciosAnteriores = (data.tipo.precios as PrecioTipo[]).filter(
        p => !savedPrecios.find(s => s.productTypeId === p.productTypeId)
      );
      onSaved({ ...data.tipo, precios: [...preciosAnteriores, ...savedPrecios] });
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
              {isEdit ? "Editar tipo de cliente" : "Nuevo tipo de cliente"}
            </h3>
            <p className="text-sm text-[#7f7663] mt-1">Define el nombre y los precios por kilo</p>
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
            <label className={labelClass}>Nombre del tipo *</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Mayorista, Minorista, Restaurante" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Opcional" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Precio por producto ($/kg)</label>
            <div className="space-y-2">
              {productTypes.map(pt => (
                <div key={pt.id} className="flex items-center gap-3 bg-[#f6f3f2] rounded-2xl px-4 py-3">
                  <span className="flex-1 text-sm text-[#1c1b1b] font-medium">{pt.name}</span>
                  <input
                    type="number" min="0" step="100"
                    value={precios[pt.id] ?? ""}
                    onChange={e => setPrecios(prev => ({ ...prev, [pt.id]: e.target.value }))}
                    placeholder="Sin precio"
                    className="w-36 px-3 py-2 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-right"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TiposClienteView({ initialTipos, productTypes }: Props) {
  const [tipos, setTipos] = useState<TipoCliente[]>(initialTipos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoCliente | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/tipos-cliente/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setTipos(prev => prev.filter(t => t.id !== id));
  }

  function handleSaved(saved: TipoCliente) {
    setTipos(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev];
    });
    setModalOpen(false);
    setEditingTipo(null);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#7f7663]">
          {tipos.length} tipo{tipos.length !== 1 ? "s" : ""} configurado{tipos.length !== 1 ? "s" : ""}
        </p>
        <button onClick={() => { setEditingTipo(null); setModalOpen(true); }} className="flex items-center gap-2 bg-[#735c00] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition-all active:scale-95">
          <span className="material-symbols-outlined text-base">add</span>
          Nuevo tipo
        </button>
      </div>

      {error && (
        <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-sm">error</span>{error}
        </div>
      )}

      {tipos.length === 0 ? (
        <div className="text-center py-16 text-[#7f7663]">
          <span className="material-symbols-outlined text-5xl mb-3 block">category</span>
          <p className="font-semibold">Sin tipos de cliente</p>
          <p className="text-sm mt-1">Crea tipos para asignar precios automáticos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tipos.map(tipo => (
            <div key={tipo.id} className="bg-white border border-[#f0eded] rounded-[2rem] p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[#1c1b1b] text-lg">{tipo.nombre}</h4>
                  {tipo.descripcion && <p className="text-sm text-[#7f7663] mt-0.5">{tipo.descripcion}</p>}
                  <span className="text-xs text-[#7f7663] mt-1 inline-block">
                    {tipo._count.clientes} cliente{tipo._count.clientes !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingTipo(tipo); setModalOpen(true); }} className="w-9 h-9 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#735c00] hover:bg-[#d4af37]/20 transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => handleDelete(tipo.id)} className="w-9 h-9 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              {tipo.precios.length > 0 ? (
                <div className="space-y-1.5">
                  {tipo.precios.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-[#f6f3f2] rounded-xl px-4 py-2">
                      <span className="text-sm text-[#1c1b1b]">{p.productType.name}</span>
                      <span className="text-sm font-bold text-[#735c00]">{fmt(p.precio)}/kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#d0c5af] italic">Sin precios configurados</p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TipoModal
          tipo={editingTipo}
          productTypes={productTypes}
          onClose={() => { setModalOpen(false); setEditingTipo(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

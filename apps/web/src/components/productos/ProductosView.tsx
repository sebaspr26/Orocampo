"use client";
import { useState } from "react";

interface ProductType {
  id: string;
  name: string;
  description?: string | null;
  minStockKg: number;
  createdAt: string;
}

const inputClass = "w-full px-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";

function ProductoModal({ producto, onClose, onSaved }: {
  producto: ProductType | null;
  onClose: () => void;
  onSaved: (p: ProductType) => void;
}) {
  const isEdit = !!producto;
  const [name, setName] = useState(producto?.name ?? "");
  const [description, setDescription] = useState(producto?.description ?? "");
  const [minStockKg, setMinStockKg] = useState(String(producto?.minStockKg ?? "10"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isEdit ? `/api/product-types/${producto.id}` : "/api/product-types";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, minStockKg: parseFloat(minStockKg) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.productType);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
              {isEdit ? "Editar producto" : "Nuevo tipo de producto"}
            </h3>
            <p className="text-sm text-[#7f7663] mt-1">Quesos, lácteos y demás productos</p>
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
            <label className={labelClass}>Nombre del producto *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Ej: Queso campesino, Cuajada, Leche"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Opcional"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stock mínimo (kg)</label>
            <input
              type="number" min="0" step="0.5" value={minStockKg}
              onChange={e => setMinStockKg(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-[#7f7663] mt-1 px-1">Alerta cuando el inventario baje de este valor</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductosView({ initialProductos }: { initialProductos: ProductType[] }) {
  const [productos, setProductos] = useState<ProductType[]>(initialProductos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ProductType | null>(null);
  const [busqueda, setBusqueda] = useState("");

  function handleSaved(saved: ProductType) {
    setProductos(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      return idx >= 0 ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev];
    });
    setModalOpen(false);
    setEditando(null);
  }

  const filtrados = productos.filter(p =>
    p.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#d0c5af] text-base">search</span>
          <input
            type="text" placeholder="Buscar producto..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f6f3f2] border-none rounded-full text-sm text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>
        <button
          onClick={() => { setEditando(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-[#735c00] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nuevo producto
        </button>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-[#7f7663]">
          <span className="material-symbols-outlined text-5xl mb-3 block">egg_alt</span>
          <p className="font-semibold">{busqueda ? "Sin resultados" : "Sin productos registrados"}</p>
          <p className="text-sm mt-1">{busqueda ? "Intenta con otro término" : "Crea el primer tipo de producto"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(p => (
            <div key={p.id} className="bg-white border border-[#f0eded] rounded-[2rem] p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1c1b1b] text-base truncate">{p.name}</h4>
                  {p.description && (
                    <p className="text-sm text-[#7f7663] mt-0.5 truncate">{p.description}</p>
                  )}
                </div>
                <button
                  onClick={() => { setEditando(p); setModalOpen(true); }}
                  className="w-9 h-9 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#735c00] hover:bg-[#d4af37]/20 transition-colors shrink-0 ml-3"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[#f6f3f2] rounded-xl px-4 py-2.5">
                <span className="material-symbols-outlined text-sm text-[#735c00]">inventory_2</span>
                <span className="text-xs text-[#7f7663]">Stock mínimo</span>
                <span className="ml-auto text-sm font-bold text-[#735c00]">{p.minStockKg} kg</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductoModal
          producto={editando}
          onClose={() => { setModalOpen(false); setEditando(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

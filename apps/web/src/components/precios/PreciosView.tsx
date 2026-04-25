"use client";
import { useState } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import TiposClienteView from "./TiposClienteView";

interface Cliente { id: string; nombre: string; }
interface ProductType { id: string; name: string; }

interface Precio {
  id: string;
  clienteId: string;
  cliente: { id: string; nombre: string };
  productTypeId: string;
  productType: { id: string; name: string };
  precio: number;
  createdAt: string;
}

interface PrecioTipo { id: string; productTypeId: string; productType: { id: string; name: string }; precio: number; }
interface TipoCliente {
  id: string; nombre: string; descripcion?: string | null; isActive: boolean;
  precios: PrecioTipo[]; _count: { clientes: number };
}

interface Props {
  initialPrecios: Precio[];
  clientes: Cliente[];
  productTypes: ProductType[];
  initialTipos: TipoCliente[];
}

const inputClass = "w-full px-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";
const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export default function PreciosView({ initialPrecios, clientes, productTypes, initialTipos }: Props) {
  const [tab, setTab] = useState<"precios" | "tipos">("precios");
  const [precios, setPrecios] = useState<Precio[]>(initialPrecios);
  const [formOpen, setFormOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [precio, setPrecio] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = precios.filter(p => !filterCliente || p.clienteId === filterCliente);
  const clientesConPrecios = [...new Set(precios.map(p => p.clienteId))].length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!clienteId || !productTypeId || !precio) { setError("Completa todos los campos"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, productTypeId, precio: parseFloat(precio) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      const existing = precios.find(p => p.clienteId === clienteId && p.productTypeId === productTypeId);
      if (existing) {
        setPrecios(prev => prev.map(p => p.clienteId === clienteId && p.productTypeId === productTypeId ? data.precio : p));
      } else {
        setPrecios(prev => [data.precio, ...prev]);
      }
      setFormOpen(false);
      setClienteId(""); setProductTypeId(""); setPrecio("");
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/precios/${id}`, { method: "DELETE" });
      setPrecios(prev => prev.filter(p => p.id !== id));
    } catch { /* silencioso */ }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#d4af37]/20 relative overflow-hidden">
          <p className="text-white/80 text-sm">Tipos de cliente</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter">{initialTipos.length}</h3>
          <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-white/5">category</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Clientes con precio especial</p>
          <h3 className="text-3xl font-bold mt-1">{clientesConPrecios}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Precios individuales activos</p>
          <h3 className="text-3xl font-bold mt-1">{precios.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-[#f0eded] bg-[#f6f3f2] mx-6 mt-6 rounded-full">
          <button
            onClick={() => setTab("tipos")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${tab === "tipos" ? "bg-white text-[#1c1b1b] shadow-sm" : "text-[#7f7663] hover:text-[#1c1b1b]"}`}
          >
            Tipos de cliente
          </button>
          <button
            onClick={() => setTab("precios")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${tab === "precios" ? "bg-white text-[#1c1b1b] shadow-sm" : "text-[#7f7663] hover:text-[#1c1b1b]"}`}
          >
            Precios individuales
          </button>
        </div>

        <div className="p-8">
          {tab === "tipos" ? (
            <TiposClienteView initialTipos={initialTipos} productTypes={productTypes} />
          ) : (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <h4 className="text-xl font-bold">Precios especiales por cliente</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={filterCliente} onChange={e => setFilterCliente(e.target.value)}
                    className="bg-[#f6f3f2] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]">
                    <option value="">Todos los clientes</option>
                    {clientes.filter(c => precios.some(p => p.clienteId === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <button onClick={() => setFormOpen(v => !v)}
                    className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-lg">{formOpen ? "close" : "add"}</span>
                    {formOpen ? "Cancelar" : "Nuevo precio"}
                  </button>
                </div>
              </div>

              {formOpen && (
                <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#fafaf9] border border-[#f0eded] mb-6">
                  {error && (
                    <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">error</span>{error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className={labelClass}>Cliente *</label>
                      <SearchableSelect options={clientes.map(c => ({ value: c.id, label: c.nombre }))} value={clienteId} onChange={setClienteId} placeholder="Seleccionar..." required />
                    </div>
                    <div>
                      <label className={labelClass}>Producto *</label>
                      <select value={productTypeId} onChange={e => setProductTypeId(e.target.value)} required className={inputClass}>
                        <option value="">Seleccionar...</option>
                        {productTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Precio / kg *</label>
                      <input type="number" min="1" step="100" value={precio} onChange={e => setPrecio(e.target.value)} required placeholder="Ej: 15000" className={inputClass} />
                    </div>
                    <button type="submit" disabled={loading} className="bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all">
                      {loading ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              )}

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-[#d0c5af] mb-3 block">price_change</span>
                  <h5 className="font-bold text-[#1c1b1b] mb-2">Sin precios individuales</h5>
                  <p className="text-sm text-[#7f7663]">Usa los tipos de cliente para precios automáticos, o agrega uno aquí para casos especiales.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#f0eded]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                        <th className="px-6 py-4 text-left font-bold">Cliente</th>
                        <th className="px-6 py-4 text-left font-bold">Producto</th>
                        <th className="px-6 py-4 text-right font-bold">Precio / kg</th>
                        <th className="px-6 py-4 text-left font-bold">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} className="border-t border-[#f0eded] hover:bg-[#fafaf9] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-[#735c00]">{p.cliente.nombre.slice(0, 2).toUpperCase()}</span>
                              </div>
                              <span className="font-semibold text-[#1c1b1b]">{p.cliente.nombre}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#4d4635]">{p.productType.name}</td>
                          <td className="px-6 py-4 text-right font-bold text-[#735c00]">{fmt(p.precio)}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleDelete(p.id)} className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

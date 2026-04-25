"use client";
import { useState, useEffect } from "react";

interface Domiciliario { id: string; name: string | null; email: string; }
interface ClienteSimple { id: string; nombre: string; telefono?: string | null; direccion?: string | null; isActive: boolean; }

interface Ruta {
  id: string;
  nombre: string;
  domiciliarioId: string;
  domiciliario: Domiciliario;
  clientes: ClienteSimple[];
}

interface Props {
  ruta?: Ruta | null;
  clientes: ClienteSimple[];
  onClose: () => void;
  onSaved: (ruta: Ruta) => void;
}

export default function RutaFormModal({ ruta, clientes, onClose, onSaved }: Props) {
  const [nombre, setNombre] = useState(ruta?.nombre ?? "");
  const [domiciliarioId, setDomiciliarioId] = useState(ruta?.domiciliarioId ?? "");
  const [selectedClienteIds, setSelectedClienteIds] = useState<string[]>(ruta?.clientes.map(c => c.id) ?? []);
  const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rutas/domiciliarios").then(r => r.json()).then(d => setDomiciliarios(d.domiciliarios ?? []));
  }, []);

  function toggleCliente(id: string) {
    setSelectedClienteIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.direccion ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !domiciliarioId) { setError("Nombre y domiciliario son requeridos"); return; }
    setLoading(true);
    setError("");
    try {
      const url = ruta ? `/api/rutas/${ruta.id}` : "/api/rutas";
      const method = ruta ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), domiciliarioId, clienteIds: selectedClienteIds }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.ruta);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcf9f8] rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <h3 className="text-xl font-extrabold text-[#1c1b1b]">{ruta ? "Editar Ruta" : "Nueva Ruta"}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#f0eded] transition-colors">
            <span className="material-symbols-outlined text-[#7f7663]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="bg-[#ffdad6] text-[#ba1a1a] text-sm font-semibold px-4 py-3 rounded-xl">{error}</div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#7f7663] block mb-2">Nombre de la ruta</label>
              <input
                value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full bg-[#f6f3f2] border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                placeholder="Ej: Ruta Norte, Ruta Centro..."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#7f7663] block mb-2">Domiciliario</label>
              <select
                value={domiciliarioId} onChange={e => setDomiciliarioId(e.target.value)}
                className="w-full bg-[#f6f3f2] border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              >
                <option value="">Seleccionar domiciliario...</option>
                {domiciliarios.map(d => (
                  <option key={d.id} value={d.id}>{d.name ?? d.email}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7f7663]">
                  Clientes en esta ruta
                  <span className="ml-2 bg-[#d4af37]/20 text-[#735c00] px-2 py-0.5 rounded-full text-[10px] font-black">{selectedClienteIds.length}</span>
                </label>
              </div>
              <div className="relative mb-3">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663] text-sm">search</span>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#f6f3f2] border-none rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  placeholder="Buscar cliente..."
                />
              </div>
              <div className="max-h-52 overflow-y-auto rounded-2xl border border-[#f0eded] divide-y divide-[#f0eded]">
                {clientesFiltrados.length === 0 ? (
                  <p className="text-center text-sm text-[#7f7663] py-6">Sin clientes</p>
                ) : clientesFiltrados.map(c => {
                  const selected = selectedClienteIds.includes(c.id);
                  return (
                    <button
                      key={c.id} type="button"
                      onClick={() => toggleCliente(c.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f6f3f2] ${selected ? "bg-[#d4af37]/10" : ""}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-[#735c00] border-[#735c00]" : "border-[#d4af37]/50"}`}>
                        {selected && <span className="material-symbols-outlined text-white" style={{ fontSize: "14px" }}>check</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1c1b1b] truncate">{c.nombre}</p>
                        {c.direccion && <p className="text-[11px] text-[#7f7663] truncate">{c.direccion}</p>}
                      </div>
                      {!c.isActive && <span className="text-[10px] bg-[#f0eded] text-[#7f7663] px-2 py-0.5 rounded-full font-bold">Inactivo</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[#f0eded] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full text-sm font-bold text-[#7f7663] hover:bg-[#f0eded] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#735c00] text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
              {loading ? "Guardando..." : ruta ? "Guardar cambios" : "Crear ruta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

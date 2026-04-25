"use client";
import { useState } from "react";
import RutaFormModal from "./RutaFormModal";

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
  initialRutas: Ruta[];
  clientes: ClienteSimple[];
  readOnly?: boolean;
}

export default function RutasView({ initialRutas, clientes, readOnly = false }: Props) {
  const [rutas, setRutas] = useState<Ruta[]>(initialRutas);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ruta | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate() { setEditing(null); setModalOpen(true); }
  function handleEdit(r: Ruta) { setEditing(r); setModalOpen(true); }

  function handleSaved(saved: Ruta) {
    setRutas(prev => {
      const exists = prev.find(r => r.id === saved.id);
      return exists ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev];
    });
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta ruta? Los clientes quedarán sin ruta asignada.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/rutas/${id}`, { method: "DELETE" });
      if (res.ok) setRutas(prev => prev.filter(r => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const totalClientes = rutas.reduce((sum, r) => sum + r.clientes.length, 0);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#d4af37]/20 relative overflow-hidden">
          <p className="text-white/80 text-sm font-medium">Rutas activas</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter">{rutas.length}</h3>
          <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-white/5">route</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Total clientes asignados</p>
          <h3 className="text-3xl font-bold mt-1">{totalClientes}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Sin ruta asignada</p>
          <h3 className="text-3xl font-bold mt-1">
            {clientes.filter(c => !rutas.some(r => r.clientes.some(rc => rc.id === c.id))).length}
          </h3>
        </div>
      </div>

      {/* Lista de rutas */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <h4 className="text-xl font-bold">Rutas de Reparto</h4>
          {!readOnly && (
            <button onClick={handleCreate} className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">add</span>Nueva Ruta
            </button>
          )}
        </div>

        {rutas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#735c00] text-3xl">route</span>
            </div>
            <h5 className="font-bold text-[#1c1b1b] mb-2">Sin rutas registradas</h5>
            {!readOnly && (
              <button onClick={handleCreate} className="flex items-center gap-2 bg-[#735c00] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all mx-auto mt-4">
                <span className="material-symbols-outlined text-lg">add</span>Nueva Ruta
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#f0eded]">
            {rutas.map(ruta => (
              <div key={ruta.id}>
                <div className="flex items-center gap-4 px-8 py-5 hover:bg-[#fafaf9] transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1c1b1b]">{ruta.nombre}</p>
                    <p className="text-sm text-[#7f7663] mt-0.5">
                      <span className="material-symbols-outlined text-xs align-middle mr-1">person</span>
                      {ruta.domiciliario.name ?? ruta.domiciliario.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(expanded === ruta.id ? null : ruta.id)}
                      className="flex items-center gap-1.5 bg-[#f6f3f2] hover:bg-[#d4af37]/10 text-[#735c00] px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">group</span>
                      {ruta.clientes.length} clientes
                      <span className="material-symbols-outlined text-sm">{expanded === ruta.id ? "expand_less" : "expand_more"}</span>
                    </button>
                    {!readOnly && (
                      <>
                        <button onClick={() => handleEdit(ruta)} className="p-2 text-[#735c00] hover:bg-[#d4af37]/10 rounded-xl transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(ruta.id)} disabled={deletingId === ruta.id} className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors disabled:opacity-50" title="Eliminar">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expanded === ruta.id && (
                  <div className="bg-[#fafaf9] px-8 pb-5">
                    {ruta.clientes.length === 0 ? (
                      <p className="text-sm text-[#7f7663] py-3 italic">Sin clientes asignados</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                        {ruta.clientes.map((c, i) => (
                          <div key={c.id} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#f0eded]">
                            <span className="text-xs font-black text-[#735c00] w-5 shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1c1b1b] truncate">{c.nombre}</p>
                              {c.direccion && <p className="text-[11px] text-[#7f7663] truncate">{c.direccion}</p>}
                            </div>
                            {!c.isActive && <span className="text-[10px] bg-[#f0eded] text-[#7f7663] px-2 py-0.5 rounded-full font-bold shrink-0">Inactivo</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <RutaFormModal
          ruta={editing}
          clientes={clientes}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

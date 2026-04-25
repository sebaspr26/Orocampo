"use client";
import { useState } from "react";
import ClienteFormModal from "./ClienteFormModal";
import EstadoCuentaModal from "./EstadoCuentaModal";

interface Cliente {
  id: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  notas?: string | null;
  isActive: boolean;
  carteraPendiente: number;
  ventasPendientes: number;
  tipoClienteId?: string | null;
  tipoCliente?: { id: string; nombre: string } | null;
}

export default function ClientesView({ initialClientes }: { initialClientes: Cliente[] }) {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [estadoCuentaCliente, setEstadoCuentaCliente] = useState<{ id: string; nombre: string } | null>(null);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefono ?? "").includes(search) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCartera = clientes.reduce((sum, c) => sum + c.carteraPendiente, 0);
  const clientesActivos = clientes.filter(c => c.isActive).length;
  const conCartera = clientes.filter(c => c.carteraPendiente > 0).length;

  function handleCreate() { setEditing(null); setModalOpen(true); }
  function handleEdit(c: Cliente) { setEditing(c); setModalOpen(true); }

  function handleSaved(saved: Cliente) {
    setClientes(prev => {
      const exists = prev.find(c => c.id === saved.id);
      return exists ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
    });
    setModalOpen(false);
  }

  async function handleToggle(c: Cliente) {
    setLoadingId(c.id);
    try {
      const res = await fetch(`/api/clientes/${c.id}/toggle`, { method: "PATCH" });
      if (res.ok) setClientes(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
    } finally { setLoadingId(null); }
  }

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 bg-[#d4af37] p-6 rounded-[2rem] text-white shadow-xl shadow-[#d4af37]/20 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total Clientes</p>
          <h3 className="text-3xl font-black text-white">{clientes.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
          <p className="text-[#7f7663] text-xs font-semibold uppercase tracking-wider">Activos</p>
          <h3 className="text-2xl font-black text-[#1c1b1b]">{clientesActivos}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <p className="text-[#7f7663] text-xs font-semibold uppercase tracking-wider">Cartera Total</p>
          <h3 className="text-xl font-black text-[#1c1b1b]">{fmt(totalCartera)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#ffdad6] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#ba1a1a]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <p className="text-[#7f7663] text-xs font-semibold uppercase tracking-wider">Con Deuda</p>
          <h3 className="text-2xl font-black text-[#ba1a1a]">{conCartera}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <h4 className="text-xl font-bold">Lista de Clientes</h4>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663]">search</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                className="bg-[#f6f3f2] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-56"
                placeholder="Buscar cliente..."
              />
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">person_add</span>
              Nuevo
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#735c00] text-3xl">group</span>
            </div>
            <h5 className="font-bold text-[#1c1b1b] mb-2">{search ? "Sin resultados" : "Sin clientes registrados"}</h5>
            {!search && (
              <button onClick={handleCreate} className="flex items-center gap-2 bg-[#735c00] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all mx-auto mt-4">
                <span className="material-symbols-outlined text-lg">person_add</span>Nuevo Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 text-left font-bold">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold">Tipo</th>
                  <th className="px-6 py-4 text-left font-bold">Contacto</th>
                  <th className="px-6 py-4 text-left font-bold">Dirección</th>
                  <th className="px-6 py-4 text-right font-bold">Cartera</th>
                  <th className="px-6 py-4 text-left font-bold">Estado</th>
                  <th className="px-6 py-4 text-left font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-[#f0eded] hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#735c00]">{c.nombre.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#1c1b1b]">{c.nombre}</p>
                          {c.ventasPendientes > 0 && <p className="text-[10px] text-[#ba1a1a] font-bold">{c.ventasPendientes} factura(s) pendiente(s)</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.tipoCliente ? (
                        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#d4af37]/20 text-[#735c00]">
                          {c.tipoCliente.nombre}
                        </span>
                      ) : (
                        <span className="text-[#d0c5af] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#4d4635]">
                      <p>{c.telefono ?? "—"}</p>
                      <p className="text-xs text-[#7f7663]">{c.email ?? ""}</p>
                    </td>
                    <td className="px-6 py-4 text-[#4d4635] max-w-[180px] truncate">{c.direccion ?? "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${c.carteraPendiente > 0 ? "text-[#ba1a1a]" : "text-[#735c00]"}`}>
                        {fmt(c.carteraPendiente)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-[#f0eded] text-[#7f7663]"}`}>
                        {c.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEstadoCuentaCliente({ id: c.id, nombre: c.nombre })} className="p-2 text-[#735c00] hover:bg-[#d4af37]/10 rounded-xl transition-colors" title="Estado de cuenta">
                          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                        </button>
                        <button onClick={() => handleEdit(c)} className="p-2 text-[#735c00] hover:bg-[#d4af37]/10 rounded-xl transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleToggle(c)} disabled={loadingId === c.id} className="p-2 text-[#7f7663] hover:bg-[#f0eded] rounded-xl transition-colors disabled:opacity-50" title={c.isActive ? "Desactivar" : "Activar"}>
                          <span className="material-symbols-outlined text-sm">{c.isActive ? "person_off" : "person"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && <ClienteFormModal cliente={editing} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
      {estadoCuentaCliente && (
        <EstadoCuentaModal
          clienteId={estadoCuentaCliente.id}
          clienteNombre={estadoCuentaCliente.nombre}
          onClose={() => setEstadoCuentaCliente(null)}
        />
      )}
    </>
  );
}

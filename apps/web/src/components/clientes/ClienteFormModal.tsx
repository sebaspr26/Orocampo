"use client";
import { useState, useEffect } from "react";

interface TipoCliente { id: string; nombre: string; }

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

interface Props {
  cliente: Cliente | null;
  onClose: () => void;
  onSaved: (cliente: Cliente) => void;
}

export default function ClienteFormModal({ cliente, onClose, onSaved }: Props) {
  const isEdit = !!cliente;
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [notas, setNotas] = useState(cliente?.notas ?? "");
  const [tipoClienteId, setTipoClienteId] = useState(cliente?.tipoClienteId ?? "");
  const [tipos, setTipos] = useState<TipoCliente[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tipos-cliente")
      .then(r => r.json())
      .then(d => setTipos(d.tipos ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/clientes/${cliente.id}` : "/api/clientes", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, email, direccion, notas, tipoClienteId: tipoClienteId || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      onSaved(data.cliente);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full pl-4 pr-4 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2";

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
            <p className="text-sm text-[#7f7663] mt-1">{isEdit ? "Actualiza los datos del cliente" : "Registra un nuevo cliente en el sistema"}</p>
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
            <label className={labelClass}>Nombre del cliente *</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Supermercado El Sol" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 300 123 4567" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Correo</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Dirección</label>
            <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Cra 15 #23-45, Barrio Centro" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tipo de cliente</label>
            <select value={tipoClienteId} onChange={e => setTipoClienteId(e.target.value)} className={`${inputClass} bg-[#f6f3f2]`}>
              <option value="">Sin tipo asignado</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Información adicional..." rows={2} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#eae7e7] text-[#7f7663] hover:bg-[#f6f3f2] py-3 rounded-full text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#735c00] hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95">
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

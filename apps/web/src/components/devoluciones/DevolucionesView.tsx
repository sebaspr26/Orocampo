"use client";
import { useState } from "react";
import DevolucionFormModal from "./DevolucionFormModal";

interface Cliente { id: string; nombre: string; }
interface ProductType { id: string; name: string; }
interface VentaRef { id: string; total: number; cliente: { nombre: string }; estado: string; }

interface DevolucionItem {
  id: string;
  productType: { name: string };
  cantidadKg: number;
  razon: string;
}

interface Devolucion {
  id: string;
  cliente: { id: string; nombre: string };
  venta?: { id: string; total: number } | null;
  motivo: string;
  estado: string;
  createdAt: string;
  items: DevolucionItem[];
}

interface Props {
  initialDevoluciones: Devolucion[];
  clientes: Cliente[];
  ventas: VentaRef[];
  productTypes: ProductType[];
}

const RAZON_LABELS: Record<string, string> = {
  CLIENTE_RECHAZO: "Rechazo cliente",
  VENCIDO: "Vencido",
  MAL_ESTADO: "Mal estado",
  EXCESO: "Exceso pedido",
};

export default function DevolucionesView({ initialDevoluciones, clientes, ventas, productTypes }: Props) {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(initialDevoluciones);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = devoluciones.filter(d =>
    d.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    d.motivo.toLowerCase().includes(search.toLowerCase())
  );

  const totalKg = devoluciones.reduce((s, d) => s + d.items.reduce((ss, i) => ss + i.cantidadKg, 0), 0);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const razonBadge = (r: string) => r === "VENCIDO" || r === "MAL_ESTADO" ? "bg-[#ffdad6] text-[#ba1a1a]" : r === "CLIENTE_RECHAZO" ? "bg-amber-50 text-amber-700" : "bg-[#f0eded] text-[#7f7663]";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#d4af37]/20 relative overflow-hidden">
          <p className="text-white/80 text-sm">Total Devoluciones</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter">{devoluciones.length}</h3>
          <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-white/5">assignment_return</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Kg devueltos</p>
          <h3 className="text-3xl font-bold text-[#ba1a1a] mt-1">{totalKg.toFixed(1)} kg</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Por vencimiento / mal estado</p>
          <h3 className="text-3xl font-bold mt-1">
            {devoluciones.filter(d => d.items.some(i => i.razon === "VENCIDO" || i.razon === "MAL_ESTADO")).length}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <h4 className="text-xl font-bold">Devoluciones Registradas</h4>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="bg-[#f6f3f2] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-48"
                placeholder="Buscar..." />
            </div>
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">add</span>Nueva
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#735c00] text-3xl">assignment_return</span>
            </div>
            <h5 className="font-bold text-[#1c1b1b] mb-2">{search ? "Sin resultados" : "Sin devoluciones registradas"}</h5>
            {!search && (
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-[#735c00] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all mx-auto mt-4">
                <span className="material-symbols-outlined text-lg">add</span>Registrar Devolución
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 text-left font-bold">ID</th>
                  <th className="px-6 py-4 text-left font-bold">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold">Productos devueltos</th>
                  <th className="px-6 py-4 text-left font-bold">Motivo</th>
                  <th className="px-6 py-4 text-left font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="border-t border-[#f0eded] hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-[#7f7663] bg-[#f6f3f2] px-2 py-1 rounded-lg">#{d.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1c1b1b]">{d.cliente.nombre}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {d.items.map((item, i) => (
                          <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-full ${razonBadge(item.razon)}`}>
                            {item.productType.name} {item.cantidadKg}kg · {RAZON_LABELS[item.razon] ?? item.razon}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#4d4635] max-w-[200px] truncate" title={d.motivo}>{d.motivo}</td>
                    <td className="px-6 py-4 text-[#7f7663] text-xs">{fmtDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <DevolucionFormModal
          clientes={clientes}
          ventas={ventas}
          productTypes={productTypes}
          onClose={() => setModalOpen(false)}
          onSaved={d => { setDevoluciones(prev => [d as Devolucion, ...prev]); setModalOpen(false); }}
        />
      )}
    </>
  );
}

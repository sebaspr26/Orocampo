"use client";
import { useState } from "react";
import VentaFormModal from "./VentaFormModal";

interface Cliente { id: string; nombre: string; }
interface ProductType { id: string; name: string; }

interface Venta {
  id: string;
  clienteId: string;
  cliente: { id: string; nombre: string };
  createdBy: { id: string; name: string | null };
  fecha: string;
  metodoPago: string;
  estado: string;
  total: number;
  notas?: string | null;
  items: { id: string; productTypeId: string; productType: { id: string; name: string }; cantidadKg: number; precioUnitario: number; subtotal: number }[];
  totalPagado: number;
}

interface Props {
  initialVentas: Venta[];
  clientes: Cliente[];
  productTypes: ProductType[];
}

export default function VentasView({ initialVentas, clientes, productTypes }: Props) {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const filtered = ventas.filter(v => {
    const matchSearch = v.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "TODOS" || v.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
  const ventasPendientes = ventas.filter(v => v.estado === "PENDIENTE");
  const carteraPendiente = ventasPendientes.reduce((sum, v) => sum + (v.total - v.totalPagado), 0);

  function handleSaved(saved: Venta) {
    setVentas(prev => [saved, ...prev]);
    setModalOpen(false);
  }

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  const estadoBadge = (estado: string) => {
    if (estado === "PAGADA") return "bg-emerald-100 text-emerald-700";
    if (estado === "PENDIENTE") return "bg-[#ffdad6] text-[#ba1a1a]";
    return "bg-[#f0eded] text-[#7f7663]";
  };
  const metodoBadge = (m: string) => {
    if (m === "EFECTIVO") return "bg-[#d4af37]/20 text-[#735c00]";
    if (m === "TRANSFERENCIA") return "bg-blue-50 text-blue-700";
    return "bg-[#f2e0c3] text-[#504530]";
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1 bg-[#d4af37] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#d4af37]/20 relative overflow-hidden group">
          <p className="font-medium text-white/80 text-sm">Total Ventas</p>
          <h3 className="text-4xl font-black mt-2 tracking-tighter">{fmt(totalVentas)}</h3>
          <div className="flex items-center gap-2 mt-3 text-white/80 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            <span>{ventas.length} facturas</span>
          </div>
          <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-white/5 group-hover:scale-110 transition-transform duration-700">payments</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Pendientes de cobro</p>
          <h3 className="text-3xl font-bold text-[#ba1a1a] mt-1">{fmt(carteraPendiente)}</h3>
          <p className="text-[11px] text-[#1c1b1b]/40 mt-2 font-semibold">{ventasPendientes.length} facturas pendientes</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#1c1b1b]/5">
          <p className="text-[#1c1b1b]/50 text-sm">Cobradas</p>
          <h3 className="text-3xl font-bold mt-1">{ventas.filter(v => v.estado === "PAGADA").length}</h3>
          <div className="mt-4 h-1 bg-[#f6f3f2] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: ventas.length ? `${(ventas.filter(v => v.estado === "PAGADA").length / ventas.length) * 100}%` : "0%" }}></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <h4 className="text-xl font-bold">Ventas Registradas</h4>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="bg-[#f6f3f2] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-48"
                placeholder="Buscar..." />
            </div>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="bg-[#f6f3f2] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37]">
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PAGADA">Pagadas</option>
            </select>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-[#735c00] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">add</span>Nueva Venta
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#735c00] text-3xl">receipt_long</span>
            </div>
            <h5 className="font-bold text-[#1c1b1b] mb-2">{search ? "Sin resultados" : "Sin ventas registradas"}</h5>
            {!search && (
              <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-[#735c00] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all mx-auto mt-4">
                <span className="material-symbols-outlined text-lg">add</span>Nueva Venta
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 text-left font-bold">Factura</th>
                  <th className="px-6 py-4 text-left font-bold">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold">Productos</th>
                  <th className="px-6 py-4 text-left font-bold">Método</th>
                  <th className="px-6 py-4 text-right font-bold">Total</th>
                  <th className="px-6 py-4 text-left font-bold">Vendedor</th>
                  <th className="px-6 py-4 text-left font-bold">Estado</th>
                  <th className="px-6 py-4 text-left font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-t border-[#f0eded] hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-[#7f7663] bg-[#f6f3f2] px-2 py-1 rounded-lg">#{v.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1c1b1b]">{v.cliente.nombre}</td>
                    <td className="px-6 py-4 text-[#4d4635] text-xs">
                      {v.items.map(i => `${i.productType.name} (${i.cantidadKg}kg)`).join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${metodoBadge(v.metodoPago)}`}>{v.metodoPago}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#735c00]">{fmt(v.total)}</td>
                    <td className="px-6 py-4 text-sm text-[#4d4635]">{v.createdBy?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${estadoBadge(v.estado)}`}>{v.estado}</span>
                    </td>
                    <td className="px-6 py-4 text-[#7f7663] text-xs">{fmtDate(v.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && <VentaFormModal clientes={clientes} productTypes={productTypes} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
    </>
  );
}

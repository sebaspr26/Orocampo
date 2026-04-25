"use client";
import { useState, useEffect } from "react";

interface Pago { id: string; monto: number; metodoPago: string; fecha: string; }
interface Movimiento {
  id: string;
  tipo: "VENTA";
  fecha: string;
  descripcion: string;
  cargo: number;
  abono: number;
  saldo: number;
  estado: string;
  metodoPago: string;
  pagos: Pago[];
}
interface Resumen {
  totalFacturado: number;
  totalPagado: number;
  totalCartera: number;
  numVentas: number;
}
interface EstadoCuenta {
  cliente: { id: string; nombre: string; telefono?: string | null; email?: string | null; };
  movimientos: Movimiento[];
  resumen: Resumen;
}

interface Props {
  clienteId: string;
  clienteNombre: string;
  onClose: () => void;
}

export default function EstadoCuentaModal({ clienteId, clienteNombre, onClose }: Props) {
  const [data, setData] = useState<EstadoCuenta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clientes/${clienteId}/estado-cuenta`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [clienteId]);

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  function handleWhatsApp() {
    if (!data) return;
    const { resumen, cliente, movimientos } = data;
    const pendientes = movimientos.filter(m => m.estado === "PENDIENTE");
    let msg = `*Estado de cuenta — Oro Campo*\n\n`;
    msg += `Cliente: ${cliente.nombre}\n`;
    msg += `Fecha: ${new Date().toLocaleDateString("es-CO")}\n\n`;
    msg += `Facturas facturadas: ${fmt(resumen.totalFacturado)}\n`;
    msg += `Total pagado: ${fmt(resumen.totalPagado)}\n`;
    msg += `*Saldo pendiente: ${fmt(resumen.totalCartera)}*\n\n`;
    if (pendientes.length > 0) {
      msg += `Facturas pendientes:\n`;
      pendientes.forEach(m => { msg += `• #${m.id.slice(-8).toUpperCase()} — ${fmt(m.saldo)}\n`; });
    }
    const tel = data.cliente.telefono?.replace(/\D/g, "") ?? "";
    const url = `https://wa.me/${tel.startsWith("57") ? tel : `57${tel}`}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  function handleEmail() {
    if (!data) return;
    const { resumen, cliente } = data;
    const subject = encodeURIComponent(`Estado de cuenta — Oro Campo`);
    const body = encodeURIComponent(
      `Estimado/a ${cliente.nombre},\n\nAdjuntamos su estado de cuenta:\n\nTotal facturado: ${fmt(resumen.totalFacturado)}\nTotal pagado: ${fmt(resumen.totalPagado)}\nSaldo pendiente: ${fmt(resumen.totalCartera)}\n\nCordialmente,\nOro Campo`
    );
    window.open(`mailto:${data.cliente.email ?? ""}?subject=${subject}&body=${body}`, "_blank");
  }

  function handlePrint() {
    window.print();
  }

  const estadoBadge = (e: string) => e === "PAGADA" ? "bg-emerald-100 text-emerald-700" : e === "PENDIENTE" ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#f0eded] text-[#7f7663]";

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:inset-auto print:relative">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none print:max-h-none">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded] print:hidden">
          <div>
            <h3 className="font-bold text-xl text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>Estado de cuenta</h3>
            <p className="text-sm text-[#7f7663] mt-1">{clienteNombre}</p>
          </div>
          <div className="flex items-center gap-2">
            {data?.cliente.telefono && (
              <button onClick={handleWhatsApp} title="Enviar por WhatsApp"
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-sm">chat</span>WhatsApp
              </button>
            )}
            {data?.cliente.email && (
              <button onClick={handleEmail} title="Enviar por email"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-sm">mail</span>Email
              </button>
            )}
            <button onClick={handlePrint}
              className="flex items-center gap-2 border border-[#eae7e7] text-[#7f7663] px-4 py-2 rounded-full text-sm font-bold hover:bg-[#f6f3f2] transition-colors">
              <span className="material-symbols-outlined text-sm">print</span>Imprimir
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#7f7663] hover:bg-[#eae7e7] transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-center text-[#7f7663] py-8">Error al cargar el estado de cuenta</p>
          ) : (
            <div className="space-y-6">
              {/* Header imprimible */}
              <div className="hidden print:flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-black text-[#735c00]">ORO CAMPO</h1>
                  <p className="text-sm text-[#7f7663]">Estado de cuenta</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{data.cliente.nombre}</p>
                  <p className="text-[#7f7663]">{new Date().toLocaleDateString("es-CO")}</p>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#f6f3f2] rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Facturado</p>
                  <p className="text-xl font-black text-[#1c1b1b] mt-1">{fmt(data.resumen.totalFacturado)}</p>
                </div>
                <div className="bg-[#f6f3f2] rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Pagado</p>
                  <p className="text-xl font-black text-emerald-700 mt-1">{fmt(data.resumen.totalPagado)}</p>
                </div>
                <div className={`rounded-2xl p-5 text-center ${data.resumen.totalCartera > 0 ? "bg-[#ffdad6]" : "bg-emerald-50"}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${data.resumen.totalCartera > 0 ? "text-[#ba1a1a]" : "text-emerald-700"}`}>Saldo pendiente</p>
                  <p className={`text-xl font-black mt-1 ${data.resumen.totalCartera > 0 ? "text-[#ba1a1a]" : "text-emerald-700"}`}>
                    {fmt(data.resumen.totalCartera)}
                  </p>
                </div>
              </div>

              {/* Movimientos */}
              <div>
                <h4 className="text-sm font-bold text-[#1c1b1b] mb-3">Historial de facturas</h4>
                {data.movimientos.length === 0 ? (
                  <p className="text-center text-[#7f7663] py-6 text-sm">Sin movimientos registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f6f3f2] text-[#7f7663] text-[10px] uppercase tracking-widest">
                          <th className="px-4 py-3 text-left font-bold">Factura</th>
                          <th className="px-4 py-3 text-left font-bold">Fecha</th>
                          <th className="px-4 py-3 text-left font-bold">Detalle</th>
                          <th className="px-4 py-3 text-right font-bold">Cargo</th>
                          <th className="px-4 py-3 text-right font-bold">Abono</th>
                          <th className="px-4 py-3 text-right font-bold">Saldo</th>
                          <th className="px-4 py-3 text-left font-bold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.movimientos.map(m => (
                          <tr key={m.id} className="border-t border-[#f0eded]">
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-[#7f7663] bg-[#f6f3f2] px-2 py-1 rounded">#{m.id.slice(-8).toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-3 text-[#7f7663] text-xs">{fmtDate(m.fecha)}</td>
                            <td className="px-4 py-3 text-[#4d4635] text-xs max-w-[160px] truncate">{m.descripcion}</td>
                            <td className="px-4 py-3 text-right font-semibold text-[#1c1b1b]">{fmt(m.cargo)}</td>
                            <td className="px-4 py-3 text-right text-emerald-700 font-semibold">{m.abono > 0 ? fmt(m.abono) : "—"}</td>
                            <td className="px-4 py-3 text-right font-bold">
                              <span className={m.saldo > 0 ? "text-[#ba1a1a]" : "text-emerald-700"}>{fmt(m.saldo)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${estadoBadge(m.estado)}`}>{m.estado}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

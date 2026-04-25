"use client";

interface ItemVenta {
  id: string;
  productType: { name: string };
  cantidadKg: number;
  precioUnitario: number;
  subtotal: number;
}

interface Venta {
  id: string;
  cliente: { nombre: string };
  createdBy: { name: string | null };
  fecha: string;
  metodoPago: string;
  estado: string;
  total: number;
  notas?: string | null;
  items: ItemVenta[];
  totalPagado: number;
}

interface Props {
  venta: Venta;
  onClose: () => void;
}

export default function FacturaModal({ venta, onClose }: Props) {
  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

  const saldoPendiente = venta.total - venta.totalPagado;

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#f0eded] print:hidden">
          <h3 className="font-bold text-lg text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>Factura</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#735c00] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-sm">print</span>Imprimir
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#7f7663] hover:bg-[#eae7e7] transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Contenido de la factura */}
        <div className="p-8 space-y-6" id="factura-content">
          {/* Encabezado */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#735c00]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>ORO CAMPO</h1>
              <p className="text-xs text-[#7f7663]">Distribución de productos lácteos</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Factura</p>
              <p className="font-mono text-sm font-bold text-[#1c1b1b]">#{venta.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-[#7f7663] mt-1">{fmtDate(venta.fecha)}</p>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="bg-[#f6f3f2] rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-2">Facturado a</p>
            <p className="font-bold text-[#1c1b1b]">{venta.cliente.nombre}</p>
            {venta.createdBy?.name && (
              <p className="text-xs text-[#7f7663] mt-1">Atendido por: {venta.createdBy.name}</p>
            )}
          </div>

          {/* Tabla de productos */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1c1b1b]/10">
                  <th className="text-left py-2 text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Producto</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Kg</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">P. Unitario</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map(item => (
                  <tr key={item.id} className="border-b border-[#f0eded]">
                    <td className="py-3 font-medium text-[#1c1b1b]">{item.productType.name}</td>
                    <td className="py-3 text-right text-[#4d4635]">{item.cantidadKg} kg</td>
                    <td className="py-3 text-right text-[#4d4635]">{fmt(item.precioUnitario)}</td>
                    <td className="py-3 text-right font-semibold">{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-bold text-[#1c1b1b] uppercase text-xs tracking-wider">Total</td>
                  <td className="pt-4 text-right font-black text-[#735c00] text-lg">{fmt(venta.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Info de pago */}
          <div className="border-t border-[#f0eded] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#7f7663]">Método de pago</span>
              <span className="font-semibold text-[#1c1b1b]">{venta.metodoPago}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7f7663]">Pagado</span>
              <span className="font-semibold text-emerald-700">{fmt(venta.totalPagado)}</span>
            </div>
            {saldoPendiente > 0 && (
              <div className="flex justify-between text-sm bg-[#ffdad6] rounded-xl px-3 py-2">
                <span className="font-bold text-[#ba1a1a]">Saldo pendiente</span>
                <span className="font-black text-[#ba1a1a]">{fmt(saldoPendiente)}</span>
              </div>
            )}
          </div>

          {venta.notas && (
            <div className="bg-[#f6f3f2] rounded-xl p-3 text-xs text-[#7f7663]">
              <span className="font-bold text-[#1c1b1b]">Notas: </span>{venta.notas}
            </div>
          )}

          <p className="text-center text-[10px] text-[#7f7663]">Gracias por su compra · Oro Campo</p>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";

export default async function ReportesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Root", "Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">ANÁLISIS DE DATOS</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b] mt-1">Reportes y Analítica</h2>
          <p className="text-[#4d4635] text-sm mt-2">Genera reportes de ventas, inventario, clientes y cartera.</p>
        </section>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Ventas por Período", desc: "Análisis de ventas diarias, semanales y mensuales", icon: "trending_up", color: "bg-[#d4af37]", textColor: "text-white" },
            { title: "Ventas por Producto", desc: "Los productos con mayor y menor rotación", icon: "nutrition", color: "bg-white", textColor: "text-[#1c1b1b]" },
            { title: "Ventas por Cliente", desc: "Top clientes por volumen de compra", icon: "group", color: "bg-white", textColor: "text-[#1c1b1b]" },
            { title: "Cartera y Cobros", desc: "Estado de cuenta y cartera vencida por cliente", icon: "account_balance", color: "bg-white", textColor: "text-[#1c1b1b]" },
            { title: "Inventario y Pérdidas", desc: "Reporte de productos vencidos y devoluciones", icon: "inventory_2", color: "bg-white", textColor: "text-[#1c1b1b]" },
            { title: "Margen de Ganancia", desc: "Rentabilidad por producto y período", icon: "analytics", color: "bg-white", textColor: "text-[#1c1b1b]" },
          ].map((report) => (
            <div
              key={report.title}
              className={`${report.color} rounded-[2rem] p-8 shadow-sm cursor-pointer hover:shadow-md transition-all group ${report.color === "bg-white" ? "border border-[#1c1b1b]/5" : "shadow-2xl shadow-[#d4af37]/20"}`}
            >
              <div className={`w-12 h-12 rounded-2xl ${report.color === "bg-white" ? "bg-[#d4af37]/10" : "bg-white/20"} flex items-center justify-center mb-4`}>
                <span className={`material-symbols-outlined ${report.color === "bg-white" ? "text-[#735c00]" : "text-white"}`} style={{ fontVariationSettings: "'FILL' 1" }}>{report.icon}</span>
              </div>
              <h4 className={`font-bold ${report.textColor} mb-2`}>{report.title}</h4>
              <p className={`text-sm ${report.color === "bg-white" ? "text-[#4d4635]" : "text-white/80"}`}>{report.desc}</p>
              <div className={`mt-6 flex items-center gap-2 text-xs font-bold ${report.color === "bg-white" ? "text-[#735c00]" : "text-white/90"}`}>
                <span>Generar reporte</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon notice */}
        <div className="bg-[#f6f3f2] rounded-[2rem] p-8 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
          </div>
          <div>
            <h5 className="font-bold text-[#1c1b1b]">Módulo de reportes en desarrollo</h5>
            <p className="text-sm text-[#4d4635] mt-1">Pronto podrás generar y exportar reportes completos en PDF y Excel. Los datos históricos estarán disponibles cuando se integren los módulos de ventas y pagos.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";

export default async function LogsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Root") redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <section className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">Auditoría del Sistema</span>
        <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Registros del Sistema</h2>
        <p className="text-[#4d4635] text-sm mt-1">Historial de actividades y eventos del sistema.</p>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Eventos Hoy", value: "—", icon: "today", color: "text-[#735c00]" },
          { label: "Usuarios Activos", value: "—", icon: "people", color: "text-emerald-600" },
          { label: "Alertas del Sistema", value: "0", icon: "warning", color: "text-[#ba1a1a]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center">
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-[#1c1b1b]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold">Historial de Actividad</h4>
          <div className="flex gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg">search</span>
              <input
                className="bg-[#f6f3f2] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-48"
                placeholder="Buscar..."
                type="text"
              />
            </div>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#735c00] text-3xl">history</span>
          </div>
          <h5 className="font-bold text-[#1c1b1b] mb-2">Módulo de Registros</h5>
          <p className="text-sm text-[#7f7663] max-w-sm mx-auto">
            El módulo de auditoría estará disponible próximamente. Aquí verás todas las acciones realizadas en el sistema.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

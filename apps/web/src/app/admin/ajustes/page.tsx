import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";

export default async function AjustesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Root") redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <section className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">Configuración</span>
        <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Ajustes del Sistema</h2>
        <p className="text-[#4d4635] text-sm mt-1">Configuración general del sistema ORO CAMPO.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Notificaciones", desc: "Configurar alertas automáticas de stock y cartera vencida", icon: "notifications" },
          { title: "Seguridad", desc: "Gestionar políticas de contraseñas y sesiones", icon: "security" },
          { title: "Respaldos", desc: "Programar copias de seguridad automáticas", icon: "backup" },
          { title: "Integraciones", desc: "Conectar servicios externos (WhatsApp, Email)", icon: "integration_instructions" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#1c1b1b]/5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <h4 className="font-bold text-[#1c1b1b]">{item.title}</h4>
            </div>
            <p className="text-sm text-[#4d4635]">{item.desc}</p>
            <div className="mt-4 flex items-center gap-2 text-[#735c00] text-xs font-bold">
              <span>Configurar</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

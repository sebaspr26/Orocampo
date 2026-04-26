import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import SessionsView from "@/components/admin/SessionsView";

export default async function SesionesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Root") redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-1">
          <span className="page-eyebrow">Gestión del Sistema</span>
          <h2 className="page-title">Sesiones de Dispositivos</h2>
        </section>
        <SessionsView />
      </div>
    </AppLayout>
  );
}

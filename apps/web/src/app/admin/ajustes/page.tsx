import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import AjustesClient from "@/components/admin/ajustes/AjustesClient";

export default async function AjustesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Root") redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <section className="flex flex-col gap-1">
        <span className="page-eyebrow">Configuración</span>
        <h2 className="page-title">Ajustes del Sistema</h2>
        <p className="page-subtitle mt-1">Administración y configuración global de ORO CAMPO.</p>
      </section>
      <AjustesClient />
    </AppLayout>
  );
}

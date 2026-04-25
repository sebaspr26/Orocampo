import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import ReportesView from "@/components/reportes/ReportesView";

export default async function ReportesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Root", "Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <ReportesView />
    </AppLayout>
  );
}

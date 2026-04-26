import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import TrackingView from "@/components/tracking/TrackingView";

export default async function TrackingPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Root", "Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">LOGÍSTICA</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">
            Rastreo en Vivo
          </h2>
        </section>
        <TrackingView />
      </div>
    </AppLayout>
  );
}

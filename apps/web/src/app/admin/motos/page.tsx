import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import MotosView from "@/components/admin/motos/MotosView";
import MotoAlertBanner from "@/components/admin/motos/MotoAlertBanner";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getMotos(token: string) {
  try {
    const res = await fetch(`${API_URL}/motos`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.motos;
  } catch {
    return [];
  }
}

export default async function MotosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Root", "Administrador"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const motos = await getMotos(token!);

  return (
    <AppLayout user={user}>
      <MotoAlertBanner sessionKey="motos-moto" />
      <div className="space-y-8">
        <section className="flex flex-col gap-1">
          <span className="page-eyebrow">Gestión de flota</span>
          <h2 className="page-title">Motos</h2>
          <p className="page-subtitle">Control de documentos, pico y placa y estado del parque automotor</p>
        </section>
        <MotosView initialMotos={motos} />
      </div>
    </AppLayout>
  );
}

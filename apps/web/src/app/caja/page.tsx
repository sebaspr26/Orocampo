import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import CajaView from "@/components/caja/CajaView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getCortes(token: string) {
  try {
    const res = await fetch(`${API_URL}/caja`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return res.ok ? (await res.json()).cortes : [];
  } catch { return []; }
}

export default async function CajaPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const cortes = await getCortes(token!);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-[#1c1b1b] tracking-tight" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
            Cierre de Caja
          </h2>
          <p className="text-[#7f7663] mt-1">Corte diario, arqueo y control de descuadres</p>
        </div>
        <CajaView initialCortes={cortes} />
      </div>
    </AppLayout>
  );
}

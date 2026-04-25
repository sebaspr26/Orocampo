import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import PreciosView from "@/components/precios/PreciosView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function fetchJSON(url: string, token: string) {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

export default async function PreciosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const [preciosData, clientesData, typesData, tiposData] = await Promise.all([
    fetchJSON(`${API_URL}/precios`, token!),
    fetchJSON(`${API_URL}/clientes`, token!),
    fetchJSON(`${API_URL}/product-types`, token!),
    fetchJSON(`${API_URL}/tipos-cliente`, token!),
  ]);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">GESTIÓN COMERCIAL</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b] mt-1">Precios</h2>
          <p className="text-[#7f7663] mt-1">Configura tipos de cliente y listas de precios diferenciadas</p>
        </div>
        <PreciosView
          initialPrecios={preciosData?.precios ?? []}
          clientes={clientesData?.clientes ?? []}
          productTypes={typesData?.productTypes ?? []}
          initialTipos={tiposData?.tipos ?? []}
        />
      </div>
    </AppLayout>
  );
}

import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import DevolucionesView from "@/components/devoluciones/DevolucionesView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function fetchJSON(url: string, token: string) {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

export default async function DevolucionesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria", "Domiciliario"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const [devData, clientesData, ventasData, typesData] = await Promise.all([
    fetchJSON(`${API_URL}/devoluciones`, token!),
    fetchJSON(`${API_URL}/clientes`, token!),
    fetchJSON(`${API_URL}/ventas`, token!),
    fetchJSON(`${API_URL}/product-types`, token!),
  ]);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-[#1c1b1b] tracking-tight" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
            Devoluciones
          </h2>
          <p className="text-[#7f7663] mt-1">Registra y controla los productos devueltos por clientes</p>
        </div>
        <DevolucionesView
          initialDevoluciones={devData?.devoluciones ?? []}
          clientes={clientesData?.clientes ?? []}
          ventas={ventasData?.ventas ?? []}
          productTypes={typesData?.productTypes ?? []}
        />
      </div>
    </AppLayout>
  );
}

import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import RutasView from "@/components/rutas/RutasView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getRutas(token: string) {
  try {
    const res = await fetch(`${API_URL}/rutas`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).rutas;
  } catch { return []; }
}

async function getClientes(token: string) {
  try {
    const res = await fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).clientes;
  } catch { return []; }
}

export default async function RutasPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria", "Domiciliario"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();

  const isDomiciliario = user.role === "Domiciliario";
  const [rutasData, clientesData] = await Promise.all([
    getRutas(token!),
    isDomiciliario ? Promise.resolve([]) : getClientes(token!),
  ]);

  // El domiciliario solo ve su propia ruta
  const rutas = isDomiciliario
    ? rutasData.filter((r: { domiciliarioId: string }) => r.domiciliarioId === user.id)
    : rutasData;

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">LOGÍSTICA</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">
            {isDomiciliario ? "Mi Ruta" : "Rutas de Reparto"}
          </h2>
        </section>
        <RutasView initialRutas={rutas} clientes={clientesData} readOnly={isDomiciliario} />
      </div>
    </AppLayout>
  );
}

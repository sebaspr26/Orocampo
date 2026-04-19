import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import PagosView from "@/components/pagos/PagosView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getPagos(token: string) {
  try {
    const res = await fetch(`${API_URL}/pagos`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).pagos;
  } catch { return []; }
}

async function getClientes(token: string) {
  try {
    const res = await fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).clientes;
  } catch { return []; }
}

async function getVentasPendientes(token: string) {
  try {
    const res = await fetch(`${API_URL}/ventas`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    const all = (await res.json()).ventas;
    return all.filter((v: { estado: string }) => v.estado === "PENDIENTE");
  } catch { return []; }
}

async function getResumen(token: string) {
  try {
    const res = await fetch(`${API_URL}/pagos/resumen`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return { totalHoy: 0, efectivoHoy: 0, transferenciaHoy: 0, carteraPendiente: 0 };
    return await res.json();
  } catch { return { totalHoy: 0, efectivoHoy: 0, transferenciaHoy: 0, carteraPendiente: 0 }; }
}

export default async function PagosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria", "Domiciliario"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const [pagos, clientes, ventas, resumen] = await Promise.all([
    getPagos(token!),
    getClientes(token!),
    getVentasPendientes(token!),
    getResumen(token!),
  ]);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">GESTIÓN FINANCIERA</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Registro de Pagos</h2>
        </section>
        <PagosView initialPagos={pagos} clientes={clientes} ventas={ventas} resumen={resumen} />
      </div>
    </AppLayout>
  );
}

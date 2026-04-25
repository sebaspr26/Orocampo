import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import VentasView from "@/components/ventas/VentasView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getVentas(token: string) {
  try {
    const res = await fetch(`${API_URL}/ventas`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).ventas;
  } catch { return []; }
}

async function getClientes(token: string) {
  try {
    const res = await fetch(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).clientes;
  } catch { return []; }
}

async function getProductTypes(token: string) {
  try {
    const res = await fetch(`${API_URL}/product-types`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).productTypes;
  } catch { return []; }
}

export default async function VentasPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria", "Domiciliario"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const [ventas, clientes, productTypes] = await Promise.all([
    getVentas(token!),
    getClientes(token!),
    getProductTypes(token!),
  ]);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">GESTIÓN COMERCIAL</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Ventas y Facturación</h2>
        </section>
        <VentasView initialVentas={ventas} clientes={clientes} productTypes={productTypes} userRole={user.role} />
      </div>
    </AppLayout>
  );
}

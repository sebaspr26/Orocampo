import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import ClientesView from "@/components/clientes/ClientesView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getClientes(token: string) {
  try {
    const res = await fetch(`${API_URL}/clientes`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.clientes;
  } catch { return []; }
}

export default async function ClientesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const clientes = await getClientes(token!);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">GESTIÓN COMERCIAL</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Clientes y Cartera</h2>
        </section>
        <ClientesView initialClientes={clientes} />
      </div>
    </AppLayout>
  );
}

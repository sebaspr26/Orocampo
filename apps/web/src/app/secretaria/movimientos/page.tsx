import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import MovimientosView from "@/components/inventario/MovimientosView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export default async function MovimientosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Secretaria") redirect("/dashboard");

  const token = await getToken();
  let movements = [];
  let entries = [];

  try {
    const [movRes, entRes] = await Promise.all([
      fetch(`${API_URL}/inventory/movements`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
      fetch(`${API_URL}/inventory/entries`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    ]);
    if (movRes.ok) movements = (await movRes.json()).movements;
    if (entRes.ok) entries = (await entRes.json()).entries;
  } catch { /* empty */ }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Movimientos</h2>
          <p className="text-gray-500 text-sm mt-1">Historial de entradas y salidas</p>
        </div>
        <MovimientosView initialMovements={movements} entries={entries} />
      </div>
    </AppLayout>
  );
}

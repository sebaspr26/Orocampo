import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import InventarioView from "@/components/inventario/InventarioView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function fetchJson(url: string, token: string) {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function InventarioPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Secretaria") redirect("/dashboard");

  const token = await getToken();
  const [summaryData, entriesData, alertsData, typesData] = await Promise.all([
    fetchJson(`${API_URL}/inventory/summary`, token!),
    fetchJson(`${API_URL}/inventory/entries`, token!),
    fetchJson(`${API_URL}/inventory/alerts`, token!),
    fetchJson(`${API_URL}/product-types`, token!),
  ]);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
          <p className="text-gray-500 text-sm mt-1">Gestión de productos y stock</p>
        </div>
        <InventarioView
          summary={summaryData?.summary ?? []}
          entries={entriesData?.entries ?? []}
          alerts={alertsData?.alerts ?? []}
          productTypes={typesData?.productTypes ?? []}
        />
      </div>
    </AppLayout>
  );
}

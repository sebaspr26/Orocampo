import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import InventarioView from "@/components/inventario/InventarioView";
import StockAlertBanner from "@/components/inventario/StockAlertBanner";

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
  if (!["Secretaria", "Administrador"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const [summaryData, entriesData, alertsData, typesData] = await Promise.all([
    fetchJson(`${API_URL}/inventory/summary`, token!),
    fetchJson(`${API_URL}/inventory/entries`, token!),
    fetchJson(`${API_URL}/inventory/alerts`, token!),
    fetchJson(`${API_URL}/product-types`, token!),
  ]);

  return (
    <AppLayout user={user}>
      <StockAlertBanner sessionKey="inv-stock" />
      <div className="space-y-8">
        <section className="flex flex-col gap-1">
          <span className="page-eyebrow">Gestión de Stock</span>
          <h2 className="page-title">Inventario</h2>
        </section>
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

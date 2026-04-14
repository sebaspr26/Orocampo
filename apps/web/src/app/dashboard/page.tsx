import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import { formatWeight } from "@/lib/format";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getSummary(token: string) {
  try {
    const res = await fetch(`${API_URL}/inventory/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.summary;
  } catch { return []; }
}

async function getAlerts(token: string) {
  try {
    const res = await fetch(`${API_URL}/inventory/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.alerts;
  } catch { return []; }
}

interface SummaryItem {
  id: string;
  name: string;
  totalKg: number;
  minStockKg: number;
  lowStock: boolean;
  expiringCount: number;
}

interface Alert {
  type: "LOW_STOCK" | "EXPIRY";
  productName: string;
  totalKg?: number;
  minStockKg?: number;
  batchNumber?: string;
  remainingKg?: number;
  expiryDate?: string;
  daysLeft?: number;
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const token = await getToken();
  const canSeeInventory = ["Root", "Administrador", "Secretaria"].includes(user.role);

  const [summary, alerts] = canSeeInventory
    ? await Promise.all([getSummary(token!), getAlerts(token!)])
    : [[], []];

  const lowStockAlerts = (alerts as Alert[]).filter((a) => a.type === "LOW_STOCK");
  const expiryAlerts = (alerts as Alert[]).filter((a) => a.type === "EXPIRY");

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido, <span className="font-medium">{user.name ?? user.email}</span>
          </p>
        </div>

        {canSeeInventory && (
          <>
            {/* Alerts */}
            {(lowStockAlerts.length > 0 || expiryAlerts.length > 0) && (
              <div className="space-y-2">
                {lowStockAlerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">Stock bajo:</span> {a.productName} — {formatWeight(a.totalKg!)} disponibles (mínimo {formatWeight(a.minStockKg!)})
                    </p>
                  </div>
                ))}
                {expiryAlerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <span className="text-amber-500 mt-0.5">⏰</span>
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">Próximo a vencer:</span> {a.productName} — Lote {a.batchNumber} vence en {a.daysLeft} día(s) ({formatWeight(a.remainingKg!)} restantes)
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Inventory summary cards */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Inventario actual</h3>
              {summary.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-400 text-sm">
                  Sin inventario registrado
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(summary as SummaryItem[]).map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border shadow-sm p-5 ${
                        item.lowStock ? "border-red-200" : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        {item.lowStock && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Stock bajo</span>
                        )}
                        {!item.lowStock && item.expiringCount > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Por vencer</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatWeight(item.totalKg)}</p>
                      <p className="text-xs text-gray-400 mt-1">Mínimo: {formatWeight(item.minStockKg)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!canSeeInventory && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-500 text-sm">Bienvenido al sistema de gestión Orocampo.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

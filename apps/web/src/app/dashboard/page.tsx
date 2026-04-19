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

async function getUsers(token: string) {
  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.users;
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

interface User {
  id: string;
  name: string;
  email: string;
  role: { name: string };
  isActive: boolean;
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const token = await getToken();
  const canSeeInventory = ["Root", "Administrador", "Secretaria"].includes(user.role);
  const isRoot = user.role === "Root";

  const [summary, alerts, users] = await Promise.all([
    canSeeInventory ? getSummary(token!) : Promise.resolve([]),
    canSeeInventory ? getAlerts(token!) : Promise.resolve([]),
    isRoot ? getUsers(token!) : Promise.resolve([]),
  ]);

  const lowStockAlerts = (alerts as Alert[]).filter((a) => a.type === "LOW_STOCK");
  const expiryAlerts = (alerts as Alert[]).filter((a) => a.type === "EXPIRY");
  const activeUsers = (users as User[]).filter((u) => u.isActive).length;

  // Root Dashboard
  if (isRoot) {
    return (
      <AppLayout user={user}>
        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">Entorno ROOT</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Vista General del Sistema</h2>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-transparent flex flex-col gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Usuarios Totales</p>
              <h3 className="text-3xl font-black text-[#1c1b1b] tracking-tighter">{(users as User[]).length}</h3>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>{activeUsers} activos</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Activos Ahora</p>
              <h3 className="text-3xl font-black text-[#1c1b1b] tracking-tighter">{activeUsers}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-stone-400 text-[10px] font-medium italic">Sistema operacional</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
            </div>
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Alertas Activas</p>
              <h3 className="text-3xl font-black text-[#1c1b1b] tracking-tighter">{lowStockAlerts.length + expiryAlerts.length}</h3>
            </div>
            {(lowStockAlerts.length + expiryAlerts.length) > 0 ? (
              <span className="text-[10px] font-bold text-[#ba1a1a]">{lowStockAlerts.length} stock bajo, {expiryAlerts.length} por vencer</span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-600">Sin alertas críticas</span>
            )}
          </div>

          <div className="bg-[#d4af37] p-6 rounded-[2rem] flex flex-col gap-4 shadow-xl shadow-[#d4af37]/20">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Tipos de Producto</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{(summary as SummaryItem[]).length}</h3>
            </div>
            <span className="text-white/70 text-[10px] font-bold">En inventario activo</span>
          </div>
        </section>

        {/* Users List + Inventory Alerts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold">Usuarios del Sistema</h4>
              <a href="/admin/usuarios" className="text-[10px] font-bold text-[#d4af37] uppercase hover:underline">Ver todos</a>
            </div>
            <div className="space-y-3">
              {(users as User[]).slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f6f3f2] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#735c00]">
                        {(u.name ?? u.email).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1b1b]">{u.name ?? u.email}</p>
                      <p className="text-xs text-[#4d4635]">{u.role?.name}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-[#f0eded] text-[#7f7663]"}`}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              ))}
              {(users as User[]).length === 0 && (
                <p className="text-sm text-[#7f7663] text-center py-4">No hay usuarios registrados</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-bold px-2">Panel de Alertas</h4>
            {expiryAlerts.length > 0 && (
              <div className="bg-[#f0eded]/50 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#ba1a1a] shadow-sm">
                    <span className="material-symbols-outlined">timer</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Productos por Vencer</h5>
                    <p className="text-xs text-[#4d4635]">{expiryAlerts.length} lote(s) próximo(s) a vencer</p>
                  </div>
                </div>
                <a href="/secretaria/inventario" className="mt-4 text-[10px] font-bold text-[#735c00] hover:underline uppercase tracking-wider block">Revisar Stock →</a>
              </div>
            )}
            {lowStockAlerts.length > 0 && (
              <div className="bg-[#d4af37]/10 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-2xl flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined">inventory</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Alertas de Stock Bajo</h5>
                    <p className="text-xs text-[#4d4635]">{lowStockAlerts.map(a => a.productName).join(", ")}</p>
                  </div>
                </div>
                <a href="/secretaria/inventario" className="mt-4 text-[10px] font-bold text-[#735c00] hover:underline uppercase tracking-wider block">Ver Inventario →</a>
              </div>
            )}
            {lowStockAlerts.length === 0 && expiryAlerts.length === 0 && (
              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Sistema Operacional</h5>
                    <p className="text-xs text-emerald-600">No hay alertas críticas activas</p>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Summary */}
            {(summary as SummaryItem[]).length > 0 && (
              <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                <h5 className="text-sm font-bold mb-4">Inventario por Tipo</h5>
                <div className="space-y-3">
                  {(summary as SummaryItem[]).slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-[#1c1b1b]">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#735c00]">{formatWeight(item.totalKg)}</span>
                        {item.lowStock && <span className="text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full font-bold">Bajo</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </AppLayout>
    );
  }

  // Operational Dashboard for Admin/Secretaria/Domiciliario
  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <AppLayout user={user}>
      <div className="space-y-10">
        {/* Hero Header */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[#735c00] font-bold tracking-[0.2em] text-[10px] uppercase">PANEL DE CONTROL</span>
            <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b] mt-2">Visión General</h2>
          </div>
          <div className="bg-[#f6f3f2] px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <span className="material-symbols-outlined text-[#d4af37]">calendar_today</span>
            <span className="text-sm font-semibold capitalize">{today}</span>
          </div>
        </section>

        {/* Alerts */}
        {(lowStockAlerts.length > 0 || expiryAlerts.length > 0) && (
          <section className="space-y-3">
            {expiryAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#ffdad6]/50 border border-[#ba1a1a]/10 rounded-2xl px-6 py-4">
                <span className="material-symbols-outlined text-[#ba1a1a]">timer</span>
                <p className="text-sm text-[#93000a]">
                  <span className="font-semibold">Próximo a vencer:</span> {a.productName} — Lote {a.batchNumber} vence en {a.daysLeft} día(s) ({formatWeight(a.remainingKg!)} restantes)
                </p>
              </div>
            ))}
            {lowStockAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl px-6 py-4">
                <span className="material-symbols-outlined text-[#735c00]">inventory</span>
                <p className="text-sm text-[#735c00]">
                  <span className="font-semibold">Stock bajo:</span> {a.productName} — {formatWeight(a.totalKg!)} disponibles (mínimo {formatWeight(a.minStockKg!)})
                </p>
              </div>
            ))}
          </section>
        )}

        {canSeeInventory ? (
          <>
            {/* KPI Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Hero KPI */}
              <div className="col-span-1 md:col-span-2 bg-[#d4af37] p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl shadow-[#d4af37]/20 min-h-[200px] relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="font-medium text-white/80 text-sm">Inventario Total</p>
                  <h3 className="text-4xl font-black mt-2 tracking-tighter">
                    {(summary as SummaryItem[]).reduce((sum, item) => sum + item.totalKg, 0) > 1000
                      ? `${((summary as SummaryItem[]).reduce((sum, item) => sum + item.totalKg, 0) / 1000).toFixed(1)}t`
                      : `${(summary as SummaryItem[]).reduce((sum, item) => sum + item.totalKg, 0).toFixed(0)}kg`}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm font-bold relative z-10 bg-white/10 w-fit px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-sm">inventory_2</span>
                  <span>{(summary as SummaryItem[]).length} tipos de producto</span>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[160px] text-white/5 group-hover:scale-110 transition-transform duration-700">inventory_2</span>
              </div>

              <div className="bg-white p-8 rounded-[2rem] flex flex-col justify-between shadow-sm border border-[#1c1b1b]/5">
                <div>
                  <p className="text-[#1c1b1b]/50 text-sm font-medium">Alertas de Stock</p>
                  <h3 className="text-3xl font-bold text-[#1c1b1b] mt-1">{lowStockAlerts.length}</h3>
                </div>
                <div className="mt-4 h-1 w-full bg-[#f6f3f2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ba1a1a]" style={{ width: lowStockAlerts.length > 0 ? "100%" : "0%" }}></div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] flex flex-col justify-between shadow-sm border border-[#1c1b1b]/5">
                <div>
                  <p className="text-[#1c1b1b]/50 text-sm font-medium">Por Vencer</p>
                  <h3 className={`text-3xl font-bold mt-1 ${expiryAlerts.length > 0 ? "text-[#ba1a1a]" : "text-[#1c1b1b]"}`}>{expiryAlerts.length}</h3>
                </div>
                <p className="text-[11px] text-[#1c1b1b]/40 mt-2 font-semibold">lote(s) próximo(s)</p>
              </div>
            </section>

            {/* Inventory + Alerts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Inventory Summary */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#1c1b1b]/5">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="text-xl font-bold">Inventario Actual</h4>
                    <p className="text-sm text-[#1c1b1b]/50">Stock disponible por tipo de producto</p>
                  </div>
                  <a href="/secretaria/inventario" className="px-3 py-1 text-[10px] font-bold bg-[#d4af37]/20 text-[#735c00] rounded-full uppercase hover:bg-[#d4af37]/30 transition-colors">Ver detalle</a>
                </div>
                {(summary as SummaryItem[]).length === 0 ? (
                  <div className="text-center py-12 text-[#7f7663]">
                    <span className="material-symbols-outlined text-4xl mb-3 block">inventory_2</span>
                    <p className="text-sm">Sin inventario registrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(summary as SummaryItem[]).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#f6f3f2] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#735c00] text-lg">nutrition</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1c1b1b]">{item.name}</p>
                            <p className="text-xs text-[#4d4635]">Mínimo: {formatWeight(item.minStockKg)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#735c00]">{formatWeight(item.totalKg)}</span>
                          {item.lowStock && <span className="text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-1 rounded-full font-bold">Bajo</span>}
                          {!item.lowStock && item.expiringCount > 0 && <span className="text-[10px] bg-[#d4af37]/20 text-[#735c00] px-2 py-1 rounded-full font-bold">Por vencer</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert Panel */}
              <div className="space-y-4">
                <h4 className="text-xl font-bold px-2">Panel de Alertas</h4>
                {expiryAlerts.length > 0 ? (
                  <div className="bg-[#f0eded]/50 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#ba1a1a] shadow-sm">
                        <span className="material-symbols-outlined">timer</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Productos por Vencer</h5>
                        <p className="text-xs text-[#4d4635]">{expiryAlerts.length} lote(s)</p>
                      </div>
                    </div>
                    <a href="/secretaria/inventario" className="mt-4 text-[10px] font-bold text-[#735c00] hover:underline uppercase tracking-wider block">Revisar Stock</a>
                  </div>
                ) : null}

                {lowStockAlerts.length > 0 ? (
                  <div className="bg-[#d4af37]/10 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#d4af37] rounded-2xl flex items-center justify-center text-white shadow-sm">
                        <span className="material-symbols-outlined">inventory</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Stock Bajo</h5>
                        <p className="text-xs text-[#4d4635]">{lowStockAlerts.length} producto(s)</p>
                      </div>
                    </div>
                    <a href="/secretaria/inventario" className="mt-4 text-[10px] font-bold text-[#735c00] hover:underline uppercase tracking-wider block">Hacer Pedido</a>
                  </div>
                ) : null}

                {lowStockAlerts.length === 0 && expiryAlerts.length === 0 && (
                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Sin Alertas</h5>
                        <p className="text-xs text-emerald-600">Inventario en buen estado</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="bg-white rounded-[2rem] border border-[#eae7e7] shadow-sm p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>waving_hand</span>
              </div>
              <div>
                <h4 className="font-bold text-[#1c1b1b]">Bienvenido, {user.name ?? user.email}</h4>
                <p className="text-sm text-[#4d4635] mt-1">Sistema de gestión ORO CAMPO — {user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

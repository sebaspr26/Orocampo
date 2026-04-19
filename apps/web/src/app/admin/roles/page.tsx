import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getRoles(token: string) {
  try {
    const res = await fetch(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.roles;
  } catch { return []; }
}

interface Role {
  id: string;
  name: string;
  description?: string;
  _count?: { users: number };
}

const rolePermissions: Record<string, string[]> = {
  Root: [
    "Gestión completa de usuarios",
    "Gestión de roles y permisos",
    "Acceso a registros del sistema",
    "Configuración del sistema",
    "Vista de inventario",
    "Vista de reportes",
  ],
  Administrador: [
    "Vista de dashboard y KPIs",
    "Vista y gestión de inventario",
    "Gestión de ventas",
    "Gestión de clientes",
    "Gestión de pagos",
    "Acceso a reportes",
  ],
  Secretaria: [
    "Gestión de inventario",
    "Registro de movimientos",
    "Registro de ventas",
    "Registro de pagos",
    "Gestión de clientes",
  ],
  Domiciliario: [
    "Vista del dashboard",
    "Registro de ventas en ruta",
    "Registro de pagos recibidos",
    "Vista de su ruta asignada",
  ],
};

const roleColors: Record<string, string> = {
  Root: "bg-[#735c00] text-white",
  Administrador: "bg-[#d4af37] text-[#554300]",
  Secretaria: "bg-[#f2e0c3] text-[#504530]",
  Domiciliario: "bg-[#e2dfde] text-[#5f5e5e]",
};

export default async function RolesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Root") redirect("/dashboard");

  const token = await getToken();
  const roles = await getRoles(token!);

  return (
    <AppLayout user={user}>
      <section className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">Control de Acceso</span>
        <h2 className="text-4xl font-extrabold tracking-tighter text-[#1c1b1b]">Roles y Permisos</h2>
        <p className="text-[#4d4635] text-sm mt-1">Gestiona los roles del sistema y sus permisos de acceso.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(roles as Role[]).map((role) => {
          const permissions = rolePermissions[role.name] ?? [];
          const colorClass = roleColors[role.name] ?? "bg-[#f0eded] text-[#1c1b1b]";
          return (
            <div key={role.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#1c1b1b]/5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3 ${colorClass}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {role.name === "Root" ? "shield" : role.name === "Domiciliario" ? "directions_bike" : role.name === "Secretaria" ? "badge" : "manage_accounts"}
                    </span>
                    {role.name}
                  </div>
                  <p className="text-[#4d4635] text-sm">{role.description ?? "Rol del sistema"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1c1b1b]">{role._count?.users ?? 0}</p>
                  <p className="text-[10px] text-[#7f7663] uppercase font-bold">usuarios</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663] mb-3">Permisos</p>
                {permissions.map((perm, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#f6f3f2]">
                    <span className="material-symbols-outlined text-[#735c00] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-sm text-[#1c1b1b]">{perm}</span>
                  </div>
                ))}
                {permissions.length === 0 && (
                  <p className="text-sm text-[#7f7663]">Sin permisos definidos</p>
                )}
              </div>
            </div>
          );
        })}
        {(roles as Role[]).length === 0 && (
          <div className="col-span-2 bg-white rounded-[2rem] p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-[#d0c5af] mb-3 block">verified_user</span>
            <p className="text-[#7f7663]">No hay roles registrados</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

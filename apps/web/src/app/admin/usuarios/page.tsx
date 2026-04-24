import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import UsersTable from "@/components/admin/UsersTable";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

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

export default async function UsuariosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "Root") redirect("/dashboard");

  const token = await getToken();
  const [users, roles] = await Promise.all([
    getUsers(token!),
    getRoles(token!),
  ]);

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <section className="flex flex-col gap-1">
          <span className="page-eyebrow">Gestión del Sistema</span>
          <h2 className="page-title">Usuarios</h2>
        </section>
        <UsersTable initialUsers={users} roles={roles} />
      </div>
    </AppLayout>
  );
}

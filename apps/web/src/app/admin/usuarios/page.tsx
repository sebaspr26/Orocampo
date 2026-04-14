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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona los usuarios del sistema</p>
        </div>
        <UsersTable initialUsers={users} roles={roles} />
      </div>
    </AppLayout>
  );
}

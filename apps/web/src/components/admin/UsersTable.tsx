"use client";

import { useState } from "react";
import UserFormModal from "./UserFormModal";
import { Button, Badge, EmptyState } from "@/components/ui";

interface Role { id: string; name: string; }
interface User {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: Role | null;
}
interface Props { initialUsers: User[]; roles: Role[]; }

const roleClass: Record<string, string> = {
  Root: "bg-[#735c00] text-white",
  Administrador: "bg-[#d4af37] text-[#554300]",
  Secretaria: "bg-[#f2e0c3] text-[#504530]",
  Domiciliario: "bg-[#e2dfde] text-[#5f5e5e]",
};

function initials(u: User) {
  return (u.name ?? u.email).split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function UsersTable({ initialUsers, roles }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.name ?? u.email).toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  async function handleToggle(user: User) {
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/toggle`, { method: "PATCH" });
      if (res.ok) setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } finally {
      setLoadingId(null);
    }
  }

  function handleSaved(savedUser: User) {
    setUsers((prev) => {
      const exists = prev.find((u) => u.id === savedUser.id);
      return exists
        ? prev.map((u) => (u.id === savedUser.id ? savedUser : u))
        : [savedUser, ...prev];
    });
    setModalOpen(false);
  }

  function openCreate() { setEditingUser(null); setModalOpen(true); }
  function openEdit(u: User) { setEditingUser(u); setModalOpen(true); }

  return (
    <>
      <div className="table-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <div>
            <h4 className="text-xl font-bold text-[#1c1b1b]">Usuarios del Sistema</h4>
            <p className="text-sm text-[#7f7663]">{users.length} usuario(s) registrado(s)</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663]"
                style={{ fontSize: "1.125rem" }}
              >
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-48"
                placeholder="Buscar..."
              />
            </div>
            <Button icon="add" onClick={openCreate}>Crear usuario</Button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="group"
            title={search ? "Sin resultados" : "No hay usuarios registrados"}
            description={search ? "Intenta con otro término de búsqueda" : "Crea el primer usuario del sistema"}
            action={!search ? <Button icon="add" onClick={openCreate}>Crear usuario</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header-cell">Usuario</th>
                  <th className="table-header-cell">Correo</th>
                  <th className="table-header-cell">Rol</th>
                  <th className="table-header-cell">Estado</th>
                  <th className="table-header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#735c00]">{initials(user)}</span>
                        </div>
                        <span className="font-semibold text-[#1c1b1b]">{user.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="table-cell text-[#7f7663]">{user.email}</td>
                    <td className="table-cell">
                      {user.role ? (
                        <span className={`badge ${roleClass[user.role.name] ?? "badge-neutral"}`}>
                          {user.role.name}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Sin rol</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <Badge variant={user.isActive ? "success" : "error"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" icon="edit" onClick={() => openEdit(user)}>
                          Editar
                        </Button>
                        <Button
                          variant={user.isActive ? "danger" : "secondary"}
                          size="sm"
                          disabled={loadingId === user.id}
                          onClick={() => handleToggle(user)}
                        >
                          {loadingId === user.id ? "..." : user.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

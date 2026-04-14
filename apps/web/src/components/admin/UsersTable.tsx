"use client";

import { useState } from "react";
import UserFormModal from "./UserFormModal";

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: Role | null;
}

interface Props {
  initialUsers: User[];
  roles: Role[];
}

export default function UsersTable({ initialUsers, roles }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(user: User) {
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/toggle`, { method: "PATCH" });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } finally {
      setLoadingId(null);
    }
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditingUser(null);
    setModalOpen(true);
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

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{users.length} usuario(s)</p>
          <button
            onClick={handleCreate}
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Crear usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Correo</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.role ? (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                        {user.role.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin rol</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={loadingId === user.id}
                        className={`text-xs px-2 py-1 rounded border transition disabled:opacity-50 ${
                          user.isActive
                            ? "text-red-600 border-red-200 hover:border-red-400"
                            : "text-green-600 border-green-200 hover:border-green-400"
                        }`}
                      >
                        {loadingId === user.id
                          ? "..."
                          : user.isActive
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

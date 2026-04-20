"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Role { id: string; name: string; }
interface User {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: Role | null;
}
interface Props {
  user: User | null;
  roles: Role[];
  onClose: () => void;
  onSaved: (user: User) => void;
}

export default function UserFormModal({ user, roles, onClose, onSaved }: Props) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(user?.role?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = { name, email, roleId };
      if (!isEdit || password) body.password = password;

      const res = await fetch(isEdit ? `/api/users/${user.id}` : "/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Ocurrió un error"); return; }
      onSaved(data.user);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? "Editar usuario" : "Crear usuario"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl border border-[#ba1a1a]/10">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Nombre completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
            placeholder="Nombre completo"
          />
        </div>

        <div>
          <label className="input-label">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="input-label">
            Contraseña{" "}
            {isEdit && (
              <span className="text-[#7f7663] normal-case font-normal tracking-normal">
                (vacío para no cambiar)
              </span>
            )}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
            className="input"
          />
        </div>

        <div>
          <label className="input-label">Rol</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="input bg-white"
          >
            <option value="">Sin rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 justify-center"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1 justify-center"
          >
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

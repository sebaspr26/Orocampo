"use client";

import { useEffect, useState, useCallback } from "react";

interface UserSession {
  id: string;
  name: string | null;
  email: string;
  role: string;
  mobileSession: {
    active: boolean;
    lastActivity: string;
    since: string;
  } | null;
}

const ROLE_ORDER = ["Administrador", "Secretaria", "Domiciliario"];
const ROLE_COLORS: Record<string, string> = {
  Administrador: "#735c00",
  Secretaria: "#5B4FCF",
  Domiciliario: "#1E88E5",
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

export default function SessionsView() {
  const [users, setUsers] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const forceLogout = async (userId: string) => {
    setRevoking(userId);
    try {
      await fetch(`/api/sessions/${userId}`, { method: "DELETE" });
      await fetchSessions();
    } catch {}
    setRevoking(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#735c00] border-t-transparent animate-spin" />
      </div>
    );
  }

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    users: users.filter((u) => u.role === role),
  })).filter((g) => g.users.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#735c00]/[0.06] border border-[#735c00]/10">
        <span className="material-symbols-outlined text-[#735c00]" style={{ fontSize: "1.25rem" }}>info</span>
        <p className="text-sm text-[#1c1b1b]">
          Cada usuario solo puede tener <strong>una sesión móvil activa</strong>. Si pierden el dispositivo, cierra su sesión aquí para que puedan iniciar en otro.
          Las sesiones se cierran automáticamente después de <strong>7 días de inactividad</strong>.
        </p>
      </div>

      {grouped.map(({ role, users: roleUsers }) => (
        <div key={role} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: ROLE_COLORS[role] ?? "#7f7663" }} />
            <h3 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: ROLE_COLORS[role] ?? "#7f7663" }}>
              {role}s
            </h3>
            <span className="text-xs text-[#7f7663]">({roleUsers.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roleUsers.map((u) => {
              const session = u.mobileSession;
              const hasSession = session?.active;
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border bg-white transition-all ${
                    hasSession ? "border-[#1c1b1b]/10" : "border-[#1c1b1b]/[0.05]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1c1b1b] truncate">{u.name ?? u.email}</p>
                    <p className="text-xs text-[#7f7663] truncate">{u.email}</p>
                    {hasSession ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] text-[#7f7663]">
                          Activa &middot; {timeAgo(session!.lastActivity)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-2 h-2 rounded-full bg-[#1c1b1b]/15" />
                        <span className="text-[11px] text-[#7f7663]">Sin sesión móvil</span>
                      </div>
                    )}
                  </div>

                  {hasSession && (
                    <button
                      onClick={() => forceLogout(u.id)}
                      disabled={revoking === u.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#ba1a1a]/[0.08] text-[#ba1a1a] hover:bg-[#ba1a1a]/15 transition-colors disabled:opacity-50"
                    >
                      {revoking === u.id ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#ba1a1a] border-t-transparent animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>logout</span>
                      )}
                      Cerrar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

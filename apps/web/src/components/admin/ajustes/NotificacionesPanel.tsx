"use client";

import { useState, useEffect } from "react";

const ROLES = ["Administrador", "Secretaria", "Domiciliario"] as const;
type Role = (typeof ROLES)[number];

interface SentNotification {
  id: string;
  title: string;
  message: string;
  targetRoles: string[];
  createdAt: string;
  reads: { userId: string }[];
}

export default function NotificacionesPanel() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Set<Role>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SentNotification[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/notifications/sent")
      .then((r) => r.json())
      .then((d) => { if (d.notifications) setSent(d.notifications); });
  }, []);

  function toggleRole(role: Role) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(role) ? next.delete(role) : next.add(role);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(ROLES));
  }

  async function handleSend() {
    if (!title.trim() || !message.trim() || selected.size === 0) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), targetRoles: [...selected] }),
      });
      if (res.ok) {
        const data = await res.json();
        setSent((prev) => [{ ...data.notification, reads: [] }, ...prev]);
        setTitle("");
        setMessage("");
        setSelected(new Set());
        setFeedback({ ok: true, msg: "Notificación enviada correctamente." });
      } else {
        setFeedback({ ok: false, msg: "Error al enviar la notificación." });
      }
    } finally {
      setSending(false);
    }
  }

  const canSend = title.trim().length > 0 && message.trim().length > 0 && selected.size > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Compose */}
      <div className="card p-8 flex flex-col gap-6">
        <div>
          <p className="page-eyebrow mb-1">Nueva notificación</p>
          <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Redacta un mensaje y elige qué roles lo recibirán.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="input-label">Título</label>
            <input
              className="input"
              placeholder="Título de la notificación"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <label className="input-label">Mensaje</label>
            <textarea
              className="input resize-none"
              placeholder="Escribe el contenido del mensaje..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={800}
            />
          </div>
        </div>

        {/* Role selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="input-label" style={{ marginBottom: 0 }}>Destinatarios</label>
            <button
              type="button"
              onClick={selectAll}
              className="btn btn-ghost btn-sm"
            >
              Seleccionar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {ROLES.map((role) => {
              const active = selected.has(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className="btn btn-sm"
                  style={{
                    borderRadius: "9999px",
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                    background: active ? "color-mix(in srgb, var(--color-primary-container) 15%, transparent)" : "white",
                    color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {feedback && (
          <p
            className="text-sm font-medium"
            style={{ color: feedback.ok ? "var(--color-success)" : "var(--color-error)" }}
          >
            {feedback.msg}
          </p>
        )}

        <div className="flex justify-end">
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!canSend || sending}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>send</span>
            {sending ? "Enviando..." : "Enviar notificación"}
          </button>
        </div>
      </div>

      {/* Sent history */}
      {sent.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="input-label" style={{ marginBottom: 0 }}>Enviadas recientemente</p>
          <div className="flex flex-col gap-3">
            {sent.map((n) => (
              <div key={n.id} className="card p-5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>{n.title}</p>
                  <span className="text-xs shrink-0" style={{ color: "var(--color-on-surface-variant)" }}>
                    {new Date(n.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{n.message}</p>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {n.targetRoles.map((r) => (
                    <span key={r} className="badge badge-warning">{r}</span>
                  ))}
                  <span className="text-xs ml-auto" style={{ color: "var(--color-outline)" }}>
                    {n.reads.length} {n.reads.length === 1 ? "lectura" : "lecturas"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sent.length === 0 && (
        <div className="card p-10 flex flex-col items-center gap-3" style={{ textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "var(--color-outline)" }}>
            mark_chat_unread
          </span>
          <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Aún no has enviado notificaciones.
          </p>
        </div>
      )}
    </div>
  );
}

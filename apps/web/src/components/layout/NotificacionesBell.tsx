"use client";

import { useState, useEffect, useRef } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  targetRoles: string[];
  createdAt: string;
  reads: { readAt: string }[];
}

export default function NotificacionesBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.notifications) setItems(d.notifications); });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = items.filter((n) => n.reads.length === 0).length;

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, reads: [{ readAt: new Date().toISOString() }] } : n
      )
    );
  }

  async function markAllRead() {
    const unreadItems = items.filter((n) => n.reads.length === 0);
    await Promise.all(unreadItems.map((n) => fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" })));
    setItems((prev) =>
      prev.map((n) => (n.reads.length === 0 ? { ...n, reads: [{ readAt: new Date().toISOString() }] } : n))
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl transition-colors"
        style={{
          color: open ? "var(--color-primary)" : "var(--color-on-surface-variant)",
          background: open ? "color-mix(in srgb, var(--color-primary-container) 15%, transparent)" : "transparent",
        }}
      >
        <span className="material-symbols-outlined" style={open ? { fontVariationSettings: "'FILL' 1" } : {}}>
          notifications
        </span>
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[1.1rem] h-[1.1rem] rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: "var(--color-error)", color: "white" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-[1.5rem] shadow-2xl overflow-hidden z-50"
          style={{
            background: "white",
            border: "1px solid var(--color-outline-variant)",
            boxShadow: "0 8px 32px rgba(28,27,27,0.12)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--color-surface-container)" }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Notificaciones</p>
              {unread > 0 && (
                <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{unread} sin leer</p>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="btn btn-ghost btn-sm">
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 px-4" style={{ textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.75rem", color: "var(--color-outline)" }}>
                  notifications_none
                </span>
                <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Sin notificaciones</p>
              </div>
            ) : (
              items.map((n) => {
                const read = n.reads.length > 0;
                return (
                  <button
                    key={n.id}
                    onClick={() => !read && markRead(n.id)}
                    className="w-full text-left px-5 py-4 transition-colors"
                    style={{
                      background: read ? "transparent" : "color-mix(in srgb, var(--color-primary-container) 8%, transparent)",
                      borderBottom: "1px solid var(--color-surface-container)",
                      cursor: read ? "default" : "pointer",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!read && (
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                          style={{ background: "var(--color-primary)" }}
                        />
                      )}
                      <div className={!read ? "" : "ml-4"}>
                        <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{n.title}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-on-surface-variant)" }}>
                          {n.message}
                        </p>
                        <p className="text-[10px] mt-1.5" style={{ color: "var(--color-outline)" }}>
                          {new Date(n.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

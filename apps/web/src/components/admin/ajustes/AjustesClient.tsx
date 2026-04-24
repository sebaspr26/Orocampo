"use client";

import { useState } from "react";
import NotificacionesPanel from "./NotificacionesPanel";

type SectionId = "notificaciones" | "seguridad" | "respaldos" | "integraciones";

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  desc: string;
  available: boolean;
}

const sections: Section[] = [
  {
    id: "notificaciones",
    label: "Notificaciones",
    icon: "notifications",
    desc: "Envía mensajes a roles específicos del sistema.",
    available: true,
  },
  {
    id: "seguridad",
    label: "Seguridad",
    icon: "security",
    desc: "Gestiona políticas de contraseñas y sesiones.",
    available: false,
  },
  {
    id: "respaldos",
    label: "Respaldos",
    icon: "backup",
    desc: "Programa copias de seguridad automáticas.",
    available: false,
  },
  {
    id: "integraciones",
    label: "Integraciones",
    icon: "integration_instructions",
    desc: "Conecta servicios externos.",
    available: false,
  },
];

function ComingSoon({ label }: { label: string }) {
  return (
    <div
      className="card p-12 flex flex-col items-center gap-4"
      style={{ textAlign: "center" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--color-surface-container-low)" }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: "var(--color-outline)", fontSize: "1.625rem" }}
        >
          build
        </span>
      </div>
      <div>
        <p className="font-bold" style={{ color: "var(--color-on-surface)" }}>{label}</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Esta sección estará disponible próximamente.
        </p>
      </div>
      <span className="badge badge-neutral">En desarrollo</span>
    </div>
  );
}

export default function AjustesClient() {
  const [active, setActive] = useState<SectionId>("notificaciones");
  const current = sections.find((s) => s.id === active)!;

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar nav */}
      <aside
        className="shrink-0 w-56 rounded-[2rem] p-3 flex flex-col gap-1"
        style={{
          background: "white",
          border: "1px solid var(--color-outline-variant)",
        }}
      >
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{
                background: isActive
                  ? "color-mix(in srgb, var(--color-primary-container) 15%, transparent)"
                  : "transparent",
                color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "1.125rem",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {s.icon}
              </span>
              <span className="text-sm">{s.label}</span>
              {!s.available && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "var(--color-outline-variant)" }}
                />
              )}
            </button>
          );
        })}
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--color-primary-container) 15%, transparent)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: "var(--color-primary)",
                    fontSize: "1.125rem",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  {current.icon}
                </span>
              </div>
              <h3
                className="font-extrabold text-xl"
                style={{ color: "var(--color-on-surface)", fontFamily: "var(--font-headline)" }}
              >
                {current.label}
              </h3>
            </div>
            <p className="text-sm ml-[3.25rem]" style={{ color: "var(--color-on-surface-variant)" }}>
              {current.desc}
            </p>
          </div>
        </div>

        {current.available ? (
          <NotificacionesPanel />
        ) : (
          <ComingSoon label={current.label} />
        )}
      </div>
    </div>
  );
}

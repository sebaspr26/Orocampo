"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Alerta {
  motoId: string;
  placa: string;
  tipo: string;
  fecha: string;
  diasRestantes: number;
}

export default function MotoAlertBanner({ sessionKey }: { sessionKey?: string } = {}) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionKey && sessionStorage.getItem(sessionKey) === "1") {
      setDismissed(true);
      return;
    }
    fetch("/api/motos/alertas")
      .then(r => r.json())
      .then(d => setAlertas(d.alertas ?? []))
      .catch(() => {});
  }, [sessionKey]);

  function dismiss() {
    if (sessionKey) sessionStorage.setItem(sessionKey, "1");
    setDismissed(true);
  }

  if (!alertas.length || dismissed) return null;

  const urgentes = alertas.filter(a => a.diasRestantes <= 2);
  const isUrgente = urgentes.length > 0;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border text-sm ${
        isUrgente
          ? "bg-[#ffdad6] border-[#ba1a1a]/20"
          : "bg-[#fffbeb] border-amber-200"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`material-symbols-outlined shrink-0 mt-0.5 ${isUrgente ? "text-[#ba1a1a]" : "text-amber-600"}`}
          style={{ fontVariationSettings: "'FILL' 1", fontSize: "1.125rem" }}
        >
          {isUrgente ? "error" : "warning"}
        </span>
        <div className="min-w-0">
          <p className={`font-bold text-sm ${isUrgente ? "text-[#93000a]" : "text-amber-900"}`}>
            {isUrgente
              ? `${urgentes.length} documento${urgentes.length > 1 ? "s" : ""} vence${urgentes.length === 1 ? "" : "n"} en menos de 3 días`
              : `${alertas.length} documento${alertas.length > 1 ? "s" : ""} próximo${alertas.length > 1 ? "s" : ""} a vencer`
            }
          </p>
          <p className={`text-xs mt-0.5 truncate ${isUrgente ? "text-[#93000a]/70" : "text-amber-700"}`}>
            {alertas.map(a =>
              `${a.placa} · ${a.tipo}: ${a.diasRestantes === 0 ? "hoy" : `${a.diasRestantes}d`}`
            ).join("  ·  ")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/admin/motos"
          className={`text-xs font-bold underline underline-offset-2 ${
            isUrgente ? "text-[#93000a]" : "text-amber-900"
          }`}
        >
          Ver motos
        </Link>
        <button
          onClick={dismiss}
          className={`p-1 rounded-lg transition-colors ${
            isUrgente ? "hover:bg-[#ba1a1a]/10 text-[#93000a]" : "hover:bg-amber-200/60 text-amber-700"
          }`}
          title="Cerrar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
        </button>
      </div>
    </div>
  );
}

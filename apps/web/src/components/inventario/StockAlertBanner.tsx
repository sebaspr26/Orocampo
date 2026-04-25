"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StockAlert {
  type: "LOW_STOCK" | "EXPIRY";
  productName: string;
  totalKg?: number;
  minStockKg?: number;
}

export default function StockAlertBanner({ sessionKey }: { sessionKey?: string } = {}) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionKey && sessionStorage.getItem(sessionKey) === "1") {
      setDismissed(true);
      return;
    }
    fetch("/api/inventory/alerts")
      .then((r) => r.json())
      .then((d) => {
        const low = (d.alerts ?? []).filter((a: StockAlert) => a.type === "LOW_STOCK");
        setAlerts(low);
      })
      .catch(() => {});
  }, [sessionKey]);

  function dismiss() {
    if (sessionKey) sessionStorage.setItem(sessionKey, "1");
    setDismissed(true);
  }

  if (!alerts.length || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border text-sm bg-[#ffdad6] border-[#ba1a1a]/20">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="material-symbols-outlined shrink-0 mt-0.5 text-[#ba1a1a]"
          style={{ fontVariationSettings: "'FILL' 1", fontSize: "1.125rem" }}
        >
          inventory
        </span>
        <div className="min-w-0">
          <p className="font-bold text-sm text-[#93000a]">
            {alerts.length === 1
              ? `Stock bajo: ${alerts[0].productName}`
              : `${alerts.length} productos con stock bajo`}
          </p>
          <p className="text-xs mt-0.5 truncate text-[#93000a]/70">
            {alerts.map((a) => a.productName).join("  ·  ")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/secretaria/inventario"
          className="text-xs font-bold underline underline-offset-2 text-[#93000a]"
        >
          Ver inventario
        </Link>
        <button
          onClick={dismiss}
          className="p-1 rounded-lg transition-colors hover:bg-[#ba1a1a]/10 text-[#93000a]"
          title="Cerrar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
        </button>
      </div>
    </div>
  );
}

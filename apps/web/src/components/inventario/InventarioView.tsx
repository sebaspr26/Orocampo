"use client";

import { useState } from "react";
import { formatWeight, formatDate, daysUntil } from "@/lib/format";
import RegistrarEntradaModal from "./RegistrarEntradaModal";
import { Button, Badge, EmptyState } from "@/components/ui";

interface ProductType { id: string; name: string; minStockKg: number; }
interface SummaryItem {
  id: string; name: string; totalKg: number;
  minStockKg: number; lowStock: boolean; expiringCount: number;
}
interface Entry {
  id: string; batchNumber: string; entryDate: string; expiryDate: string;
  quantityKg: number; remainingKg: number; purchasePrice: number; notes?: string;
  productType: { id: string; name: string };
}
interface Alert {
  type: "LOW_STOCK" | "EXPIRY"; productName: string;
  totalKg?: number; minStockKg?: number;
  batchNumber?: string; remainingKg?: number; expiryDate?: string; daysLeft?: number;
}
interface Props {
  summary: SummaryItem[];
  entries: Entry[];
  alerts: Alert[];
  productTypes: ProductType[];
}

export default function InventarioView({
  summary,
  entries: initialEntries,
  alerts: initialAlerts,
  productTypes,
}: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [summaryItems, setSummaryItems] = useState(summary);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"stock" | "lotes">("stock");

  async function refresh() {
    const [eRes, aRes, sRes] = await Promise.all([
      fetch("/api/inventory/entries"),
      fetch("/api/inventory/alerts"),
      fetch("/api/inventory/summary"),
    ]);
    if (eRes.ok) setEntries((await eRes.json()).entries);
    if (aRes.ok) setAlerts((await aRes.json()).alerts);
    if (sRes.ok) setSummaryItems((await sRes.json()).summary);
  }

  const lowStock = alerts.filter((a) => a.type === "LOW_STOCK");
  const expiry = alerts.filter((a) => a.type === "EXPIRY");
  const totalKg = summaryItems.reduce((sum, i) => sum + i.totalKg, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-gold p-8 flex flex-col gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Stock Total</p>
            <h3 className="text-3xl font-black text-white tracking-tighter mt-1">
              {totalKg > 1000 ? `${(totalKg / 1000).toFixed(1)}t` : `${totalKg.toFixed(0)}kg`}
            </h3>
          </div>
          <p className="text-white/70 text-xs font-semibold">{summaryItems.length} tipos de producto</p>
          <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[140px] text-white/5 group-hover:scale-110 transition-transform duration-700">
            inventory_2
          </span>
        </div>

        <div className="card p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#1c1b1b]/50 text-xs font-semibold uppercase tracking-wider">Alertas Stock</p>
            <h3 className={`text-3xl font-black mt-1 tracking-tighter ${lowStock.length > 0 ? "text-[#ba1a1a]" : "text-[#1c1b1b]"}`}>
              {lowStock.length}
            </h3>
          </div>
          <div className="mt-4 h-1 w-full bg-[#f6f3f2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ba1a1a] transition-all duration-500"
              style={{ width: lowStock.length > 0 ? "100%" : "0%" }}
            />
          </div>
        </div>

        <div className="card p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#1c1b1b]/50 text-xs font-semibold uppercase tracking-wider">Por Vencer</p>
            <h3 className={`text-3xl font-black mt-1 tracking-tighter ${expiry.length > 0 ? "text-[#ba1a1a]" : "text-[#1c1b1b]"}`}>
              {expiry.length}
            </h3>
          </div>
          <p className="text-[11px] text-[#1c1b1b]/40 font-semibold mt-2">lote(s) próximo(s)</p>
        </div>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || expiry.length > 0) && (
        <div className="space-y-2">
          {lowStock.map((a, i) => (
            <div key={i} className="flex items-center gap-4 bg-[#ffdad6]/50 border border-[#ba1a1a]/10 rounded-2xl px-6 py-4">
              <span className="material-symbols-outlined text-[#ba1a1a]">inventory</span>
              <p className="text-sm text-[#93000a]">
                <span className="font-semibold">Stock bajo:</span>{" "}
                {a.productName} — {formatWeight(a.totalKg!)} disponibles (mínimo {formatWeight(a.minStockKg!)})
              </p>
            </div>
          ))}
          {expiry.map((a, i) => (
            <div key={i} className="flex items-center gap-4 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl px-6 py-4">
              <span className="material-symbols-outlined text-[#735c00]">timer</span>
              <p className="text-sm text-[#735c00]">
                <span className="font-semibold">Por vencer:</span>{" "}
                {a.productName} — Lote {a.batchNumber} vence en {a.daysLeft} día(s) ({formatWeight(a.remainingKg!)} restantes)
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table / Cards */}
      <div className="table-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 border-b border-[#f0eded]">
          <div className="flex gap-1 bg-[#f6f3f2] p-1 rounded-full">
            {(["stock", "lotes"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  tab === t ? "bg-white shadow-sm text-[#1c1b1b]" : "text-[#7f7663] hover:text-[#1c1b1b]"
                }`}
              >
                {t === "stock" ? "Por tipo" : "Lotes"}
              </button>
            ))}
          </div>
          <Button icon="add" onClick={() => setModalOpen(true)}>Registrar entrada</Button>
        </div>

        {tab === "stock" && (
          summaryItems.length === 0 ? (
            <EmptyState
              icon="inventory_2"
              title="Sin inventario registrado"
              description="Registra la primera entrada de producto"
              action={<Button icon="add" onClick={() => setModalOpen(true)}>Registrar entrada</Button>}
            />
          ) : (
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-[1.5rem] border transition-all hover:shadow-md ${
                    item.lowStock
                      ? "border-[#ba1a1a]/20 bg-[#ffdad6]/10"
                      : "border-[#1c1b1b]/5 bg-[#f6f3f2]/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#735c00]">nutrition</span>
                    </div>
                    {item.lowStock && <Badge variant="error">Stock bajo</Badge>}
                    {!item.lowStock && item.expiringCount > 0 && <Badge variant="warning">Por vencer</Badge>}
                  </div>
                  <p className="font-bold text-[#1c1b1b]">{item.name}</p>
                  <p className="text-3xl font-black text-[#735c00] mt-1 tracking-tighter">
                    {formatWeight(item.totalKg)}
                  </p>
                  <p className="text-xs text-[#7f7663] mt-1">Mínimo: {formatWeight(item.minStockKg)}</p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "lotes" && (
          entries.length === 0 ? (
            <EmptyState icon="inventory_2" title="Sin lotes registrados" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-header-cell">Tipo</th>
                    <th className="table-header-cell">Lote</th>
                    <th className="table-header-cell">Ingreso</th>
                    <th className="table-header-cell">Vencimiento</th>
                    <th className="table-header-cell" style={{ textAlign: "right" }}>Cantidad</th>
                    <th className="table-header-cell" style={{ textAlign: "right" }}>Disponible</th>
                    <th className="table-header-cell" style={{ textAlign: "right" }}>Precio/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const days = daysUntil(e.expiryDate);
                    const expired = days < 0;
                    const expiring = days >= 0 && days <= 7;
                    return (
                      <tr key={e.id} className="table-row">
                        <td className="table-cell font-semibold text-[#1c1b1b]">{e.productType.name}</td>
                        <td className="table-cell">
                          <span className="font-mono text-xs text-[#7f7663] bg-[#f6f3f2] px-2 py-1 rounded-lg">
                            {e.batchNumber}
                          </span>
                        </td>
                        <td className="table-cell text-[#7f7663]">{formatDate(e.entryDate)}</td>
                        <td className="table-cell">
                          <span
                            className={
                              expired ? "text-[#ba1a1a] font-semibold" :
                              expiring ? "text-[#735c00] font-semibold" :
                              "text-[#7f7663]"
                            }
                          >
                            {formatDate(e.expiryDate)}
                            {expired && " (vencido)"}
                            {expiring && !expired && ` (${days}d)`}
                          </span>
                        </td>
                        <td className="table-cell text-right text-[#7f7663]">{formatWeight(e.quantityKg)}</td>
                        <td className="table-cell text-right font-bold text-[#1c1b1b]">{formatWeight(e.remainingKg)}</td>
                        <td className="table-cell text-right text-[#7f7663]">
                          ${e.purchasePrice.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {modalOpen && (
        <RegistrarEntradaModal
          productTypes={productTypes}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}

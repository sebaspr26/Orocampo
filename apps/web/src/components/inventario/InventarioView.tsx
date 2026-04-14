"use client";

import { useState } from "react";
import { formatWeight, formatDate, daysUntil } from "@/lib/format";
import RegistrarEntradaModal from "./RegistrarEntradaModal";

interface ProductType { id: string; name: string; minStockKg: number; }
interface SummaryItem { id: string; name: string; totalKg: number; minStockKg: number; lowStock: boolean; expiringCount: number; }
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

export default function InventarioView({ summary, entries: initialEntries, alerts: initialAlerts, productTypes }: Props) {
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

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {(lowStock.length > 0 || expiry.length > 0) && (
        <div className="space-y-2">
          {lowStock.map((a, i) => (
            <div key={i} className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="text-red-500">⚠</span>
              <p className="text-sm text-red-700">
                <b>Stock bajo:</b> {a.productName} — {formatWeight(a.totalKg!)} disponibles (mínimo {formatWeight(a.minStockKg!)})
              </p>
            </div>
          ))}
          {expiry.map((a, i) => (
            <div key={i} className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500">⏰</span>
              <p className="text-sm text-amber-700">
                <b>Próximo a vencer:</b> {a.productName} — Lote {a.batchNumber} vence en {a.daysLeft} día(s) ({formatWeight(a.remainingKg!)} restantes)
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs + action */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setTab("stock")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === "stock" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            Por tipo
          </button>
          <button onClick={() => setTab("lotes")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === "lotes" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            Lotes
          </button>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Registrar entrada
        </button>
      </div>

      {/* Stock by type */}
      {tab === "stock" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryItems.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              Sin inventario registrado
            </div>
          )}
          {summaryItems.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-5 ${item.lowStock ? "border-red-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-800">{item.name}</p>
                {item.lowStock && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Stock bajo</span>}
                {!item.lowStock && item.expiringCount > 0 && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Por vencer</span>}
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatWeight(item.totalKg)}</p>
              <p className="text-xs text-gray-400 mt-1">Mínimo: {formatWeight(item.minStockKg)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Batches table */}
      {tab === "lotes" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Tipo</th>
                  <th className="px-5 py-3 text-left">Lote</th>
                  <th className="px-5 py-3 text-left">Ingreso</th>
                  <th className="px-5 py-3 text-left">Vencimiento</th>
                  <th className="px-5 py-3 text-right">Cantidad</th>
                  <th className="px-5 py-3 text-right">Disponible</th>
                  <th className="px-5 py-3 text-right">Precio/kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Sin lotes registrados</td></tr>
                )}
                {entries.map((e) => {
                  const days = daysUntil(e.expiryDate);
                  const expired = days < 0;
                  const expiring = days >= 0 && days <= 7;
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-900">{e.productType.name}</td>
                      <td className="px-5 py-3 text-gray-600">{e.batchNumber}</td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(e.entryDate)}</td>
                      <td className="px-5 py-3">
                        <span className={expired ? "text-red-600 font-medium" : expiring ? "text-amber-600 font-medium" : "text-gray-500"}>
                          {formatDate(e.expiryDate)}
                          {expired && " (vencido)"}
                          {expiring && !expired && ` (${days}d)`}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatWeight(e.quantityKg)}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900">{formatWeight(e.remainingKg)}</td>
                      <td className="px-5 py-3 text-right text-gray-600">${e.purchasePrice.toLocaleString("es-CO")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

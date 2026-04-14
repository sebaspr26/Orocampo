"use client";
import { useState } from "react";
import { formatWeight } from "@/lib/format";

interface Entry { id: string; batchNumber: string; productType: { name: string }; remainingKg: number; }
interface Props { entries: Entry[]; onClose: () => void; onSaved: () => void; }

export default function MovimientoModal({ entries, onClose, onSaved }: Props) {
  const [entryId, setEntryId] = useState(entries[0]?.id ?? "");
  const [type, setType] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("SALIDA");
  const [quantityKg, setQuantityKg] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedEntry = entries.find((e) => e.id === entryId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, type, quantityKg: parseFloat(quantityKg), reason: reason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error"); return; }
      onSaved();
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Registrar movimiento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lote</label>
            <select value={entryId} onChange={(e) => setEntryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              {entries.map((e) => (
                <option key={e.id} value={e.id}>{e.productType.name} — {e.batchNumber} ({formatWeight(e.remainingKg)} disp.)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de movimiento</label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              <option value="SALIDA">Salida</option>
              <option value="ENTRADA">Entrada adicional</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cantidad (kg)
              {selectedEntry && type === "SALIDA" && (
                <span className="text-gray-400 font-normal ml-1">máx. {formatWeight(selectedEntry.remainingKg)}</span>
              )}
            </label>
            <input type="number" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} required min="0.1" step="0.1"
              max={type === "SALIDA" && selectedEntry ? selectedEntry.remainingKg : undefined}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: Venta, merma, ajuste..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:border-gray-300 transition">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg text-sm transition">
              {loading ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

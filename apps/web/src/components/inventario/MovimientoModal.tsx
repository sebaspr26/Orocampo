"use client";

import { useState } from "react";
import { formatWeight } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Entry {
  id: string;
  batchNumber: string;
  productType: { name: string };
  remainingKg: number;
}
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
        body: JSON.stringify({
          entryId,
          type,
          quantityKg: parseFloat(quantityKg),
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error"); return; }
      onSaved();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Registrar movimiento" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl border border-[#ba1a1a]/10">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Lote</label>
          <select
            value={entryId}
            onChange={(e) => setEntryId(e.target.value)}
            className="input bg-white"
          >
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.productType.name} — {e.batchNumber} ({formatWeight(e.remainingKg)} disp.)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Tipo de movimiento</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="input bg-white"
          >
            <option value="SALIDA">Salida</option>
            <option value="ENTRADA">Entrada adicional</option>
            <option value="AJUSTE">Ajuste</option>
          </select>
        </div>

        <div>
          <label className="input-label">
            Cantidad (kg){" "}
            {selectedEntry && type === "SALIDA" && (
              <span className="text-[#7f7663] normal-case font-normal tracking-normal">
                máx. {formatWeight(selectedEntry.remainingKg)}
              </span>
            )}
          </label>
          <input
            type="number"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            required
            min="0.1"
            step="0.1"
            max={type === "SALIDA" && selectedEntry ? selectedEntry.remainingKg : undefined}
            className="input"
          />
        </div>

        <div>
          <label className="input-label">
            Motivo{" "}
            <span className="text-[#7f7663] normal-case font-normal tracking-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Venta, merma, ajuste..."
            className="input"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1 justify-center" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="flex-1 justify-center">
            {loading ? "Guardando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

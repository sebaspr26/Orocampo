"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ProductType { id: string; name: string; }
interface Props { productTypes: ProductType[]; onClose: () => void; onSaved: () => void; }

export default function RegistrarEntradaModal({ productTypes, onClose, onSaved }: Props) {
  const [productTypeId, setProductTypeId] = useState(productTypes[0]?.id ?? "");
  const [batchNumber, setBatchNumber] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTypeId,
          batchNumber,
          entryDate,
          expiryDate,
          quantityKg: parseFloat(quantityKg),
          purchasePrice: parseFloat(purchasePrice),
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al registrar"); return; }
      onSaved();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Registrar entrada de producto" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-2xl border border-[#ba1a1a]/10">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Tipo de queso</label>
          <select
            value={productTypeId}
            onChange={(e) => setProductTypeId(e.target.value)}
            required
            className="input bg-white"
          >
            {productTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Número de lote</label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              required
              placeholder="LOT-001"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Cantidad (kg)</label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              required
              min="0.1"
              step="0.1"
              placeholder="100"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Fecha de ingreso</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Fecha de vencimiento</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="input-label">Precio de compra (por kg)</label>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
            min="0"
            step="0.01"
            placeholder="5000"
            className="input"
          />
        </div>

        <div>
          <label className="input-label">
            Notas{" "}
            <span className="text-[#7f7663] normal-case font-normal tracking-normal">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones..."
            className="input resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1 justify-center" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="flex-1 justify-center">
            {loading ? "Registrando..." : "Registrar entrada"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

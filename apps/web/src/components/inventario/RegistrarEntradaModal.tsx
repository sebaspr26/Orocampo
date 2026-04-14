"use client";
import { useState } from "react";

interface ProductType { id: string; name: string; }

interface Props {
  productTypes: ProductType[];
  onClose: () => void;
  onSaved: () => void;
}

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
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Registrar entrada de producto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de queso</label>
              <select value={productTypeId} onChange={(e) => setProductTypeId(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                {productTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de lote</label>
              <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} required placeholder="LOT-001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad (kg)</label>
              <input type="number" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} required min="0.1" step="0.1" placeholder="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de ingreso</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de vencimiento</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio de compra (por kg)</label>
              <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required min="0" step="0.01" placeholder="5000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observaciones..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:border-gray-300 transition">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg text-sm transition">
              {loading ? "Registrando..." : "Registrar entrada"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { formatWeight, formatDate } from "@/lib/format";
import MovimientoModal from "./MovimientoModal";

interface Entry { id: string; batchNumber: string; productType: { name: string }; remainingKg: number; }
interface Movement {
  id: string; type: string; quantityKg: number; reason?: string; createdAt: string;
  entry: { batchNumber: string; productType: { name: string } };
}

interface Props { initialMovements: Movement[]; entries: Entry[]; }

export default function MovimientosView({ initialMovements, entries }: Props) {
  const [movements, setMovements] = useState(initialMovements);
  const [modalOpen, setModalOpen] = useState(false);

  async function refresh() {
    const res = await fetch("/api/inventory/movements");
    if (res.ok) setMovements((await res.json()).movements);
  }

  const typeColors: Record<string, string> = {
    ENTRADA: "bg-green-100 text-green-700",
    SALIDA: "bg-red-100 text-red-600",
    AJUSTE: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Registrar movimiento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-left">Producto</th>
                <th className="px-5 py-3 text-left">Lote</th>
                <th className="px-5 py-3 text-right">Cantidad</th>
                <th className="px-5 py-3 text-left">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {movements.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Sin movimientos registrados</td></tr>
              )}
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-gray-500">{formatDate(m.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[m.type] ?? "bg-gray-100 text-gray-600"}`}>{m.type}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{m.entry.productType.name}</td>
                  <td className="px-5 py-3 text-gray-500">{m.entry.batchNumber}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">{formatWeight(m.quantityKg)}</td>
                  <td className="px-5 py-3 text-gray-500">{m.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <MovimientoModal
          entries={entries}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}

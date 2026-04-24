"use client";

import { useState } from "react";
import { formatWeight, formatDate } from "@/lib/format";
import MovimientoModal from "./MovimientoModal";
import { Button, Badge, EmptyState } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";

interface Entry {
  id: string;
  batchNumber: string;
  productType: { name: string };
  remainingKg: number;
}
interface Movement {
  id: string;
  type: string;
  quantityKg: number;
  reason?: string;
  createdAt: string;
  entry: { batchNumber: string; productType: { name: string } };
}
interface Props { initialMovements: Movement[]; entries: Entry[]; }

const typeBadge: Record<string, BadgeVariant> = {
  ENTRADA: "success",
  SALIDA: "error",
  AJUSTE: "info",
};

export default function MovimientosView({ initialMovements, entries }: Props) {
  const [movements, setMovements] = useState(initialMovements);
  const [modalOpen, setModalOpen] = useState(false);

  async function refresh() {
    const res = await fetch("/api/inventory/movements");
    if (res.ok) setMovements((await res.json()).movements);
  }

  const entradas = movements.filter((m) => m.type === "ENTRADA");
  const salidas = movements.filter((m) => m.type === "SALIDA");
  const totalEntradas = entradas.reduce((s, m) => s + m.quantityKg, 0);
  const totalSalidas = salidas.reduce((s, m) => s + m.quantityKg, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-gold p-8 flex flex-col gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              swap_vert
            </span>
          </div>
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total Movimientos</p>
            <h3 className="text-3xl font-black text-white tracking-tighter mt-1">{movements.length}</h3>
          </div>
          <p className="text-white/70 text-xs font-semibold">registros en historial</p>
          <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[140px] text-white/5 group-hover:scale-110 transition-transform duration-700">
            swap_vert
          </span>
        </div>

        <div className="card p-8">
          <p className="text-[#1c1b1b]/50 text-xs font-semibold uppercase tracking-wider">Total Entradas</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-1 tracking-tighter">{formatWeight(totalEntradas)}</h3>
          <p className="text-xs text-[#7f7663] mt-2 font-semibold">{entradas.length} movimiento(s)</p>
        </div>

        <div className="card p-8">
          <p className="text-[#1c1b1b]/50 text-xs font-semibold uppercase tracking-wider">Total Salidas</p>
          <h3 className="text-3xl font-black text-[#ba1a1a] mt-1 tracking-tighter">{formatWeight(totalSalidas)}</h3>
          <p className="text-xs text-[#7f7663] mt-2 font-semibold">{salidas.length} movimiento(s)</p>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="flex items-center justify-between p-8 border-b border-[#f0eded]">
          <div>
            <h4 className="text-xl font-bold text-[#1c1b1b]">Historial de Movimientos</h4>
            <p className="text-sm text-[#7f7663]">{movements.length} movimiento(s) registrado(s)</p>
          </div>
          <Button icon="add" onClick={() => setModalOpen(true)}>Registrar movimiento</Button>
        </div>

        {movements.length === 0 ? (
          <EmptyState
            icon="swap_vert"
            title="Sin movimientos registrados"
            description="Registra el primer movimiento de inventario"
            action={<Button icon="add" onClick={() => setModalOpen(true)}>Registrar movimiento</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header-cell">Fecha</th>
                  <th className="table-header-cell">Tipo</th>
                  <th className="table-header-cell">Producto</th>
                  <th className="table-header-cell">Lote</th>
                  <th className="table-header-cell" style={{ textAlign: "right" }}>Cantidad</th>
                  <th className="table-header-cell">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell text-[#7f7663]">{formatDate(m.createdAt)}</td>
                    <td className="table-cell">
                      <Badge variant={typeBadge[m.type] ?? "neutral"}>{m.type}</Badge>
                    </td>
                    <td className="table-cell font-semibold text-[#1c1b1b]">{m.entry.productType.name}</td>
                    <td className="table-cell">
                      <span className="font-mono text-xs text-[#7f7663] bg-[#f6f3f2] px-2 py-1 rounded-lg">
                        {m.entry.batchNumber}
                      </span>
                    </td>
                    <td className="table-cell text-right font-bold text-[#735c00]">{formatWeight(m.quantityKg)}</td>
                    <td className="table-cell text-[#7f7663]">{m.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

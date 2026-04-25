"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Moto } from "./MotosView";

interface Props {
  moto?: Moto | null;
  onClose: () => void;
  onSaved: (moto: Moto) => void;
}

function calcVencimiento(fechaStr: string): string {
  const d = new Date(fechaStr + "T00:00:00");
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

export default function MotoFormModal({ moto, onClose, onSaved }: Props) {
  const isEdit = !!moto;
  const [placa, setPlaca] = useState(moto?.placa ?? "");
  const [notas, setNotas] = useState(moto?.notas ?? "");
  const [fechaInicioTecno, setFechaInicioTecno] = useState(
    moto?.fechaInicioTecno ? moto.fechaInicioTecno.slice(0, 10) : ""
  );
  const [fechaInicioSeguro, setFechaInicioSeguro] = useState(
    moto?.fechaInicioSeguro ? moto.fechaInicioSeguro.slice(0, 10) : ""
  );
  const [picoYPlaca, setPicoYPlaca] = useState(moto?.picoYPlaca ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) { setError("La placa es requerida"); return; }
    setLoading(true);
    setError("");

    const res = await fetch(isEdit ? `/api/motos/${moto!.id}` : "/api/motos", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placa: placa.toUpperCase().trim(),
        notas: notas || null,
        fechaInicioTecno: fechaInicioTecno || null,
        fechaInicioSeguro: fechaInicioSeguro || null,
        picoYPlaca: picoYPlaca || null,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
    onSaved(data.moto);
  }

  return (
    <Modal title={isEdit ? "Editar moto" : "Registrar moto"} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="text-sm text-[#ba1a1a] bg-[#ffdad6] rounded-xl px-4 py-3">{error}</div>
        )}

        <div>
          <label className="input-label">Placa</label>
          <input
            className="input font-bold tracking-wider uppercase"
            placeholder="ej. ABC123"
            value={placa}
            onChange={e => setPlaca(e.target.value.toUpperCase())}
            maxLength={10}
          />
        </div>

        <div>
          <label className="input-label">Notas</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Observaciones sobre la moto..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
        </div>

        <div className="h-px bg-[#f0eded]" />

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#735c00] mb-3">Tecnomecánica</p>
          <label className="input-label">Fecha de inicio</label>
          <input
            type="date"
            className="input"
            value={fechaInicioTecno}
            onChange={e => setFechaInicioTecno(e.target.value)}
          />
          {fechaInicioTecno && (
            <p className="flex items-center gap-1 text-xs text-[#7f7663] mt-2">
              <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>event</span>
              Vence el{" "}
              <span className="font-semibold text-[#1c1b1b]">{calcVencimiento(fechaInicioTecno)}</span>
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#735c00] mb-3">Seguro SOAT</p>
          <label className="input-label">Fecha de inicio</label>
          <input
            type="date"
            className="input"
            value={fechaInicioSeguro}
            onChange={e => setFechaInicioSeguro(e.target.value)}
          />
          {fechaInicioSeguro && (
            <p className="flex items-center gap-1 text-xs text-[#7f7663] mt-2">
              <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>event</span>
              Vence el{" "}
              <span className="font-semibold text-[#1c1b1b]">{calcVencimiento(fechaInicioSeguro)}</span>
            </p>
          )}
        </div>

        <div className="h-px bg-[#f0eded]" />

        <div>
          <label className="input-label">Pico y placa</label>
          <input
            className="input"
            placeholder="ej. Lunes y martes · último dígito impar"
            value={picoYPlaca}
            onChange={e => setPicoYPlaca(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar moto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

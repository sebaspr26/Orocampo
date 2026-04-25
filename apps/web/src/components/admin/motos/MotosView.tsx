"use client";

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import MotoFormModal from "./MotoFormModal";

export interface Moto {
  id: string;
  placa: string;
  notas: string | null;
  isActive: boolean;
  fechaInicioTecno: string | null;
  fechaFinTecno: string | null;
  fechaInicioSeguro: string | null;
  fechaFinSeguro: string | null;
  picoYPlaca: string | null;
  createdAt: string;
}

type DocStatus = "sin-registrar" | "vigente" | "por-vencer" | "vencido";

function getDocStatus(fechaFin: string | null): DocStatus {
  if (!fechaFin) return "sin-registrar";
  const fin = new Date(fechaFin);
  const now = new Date();
  if (fin < now) return "vencido";
  const diff = (fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 7) return "por-vencer";
  return "vigente";
}

const docStatusConfig: Record<DocStatus, { label: string; variant: "success" | "warning" | "error" | "neutral" }> = {
  "sin-registrar": { label: "Sin registrar", variant: "neutral" },
  "vigente":       { label: "Vigente",        variant: "success" },
  "por-vencer":    { label: "Vence pronto",   variant: "warning" },
  "vencido":       { label: "Vencido",        variant: "error"   },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function DiasTag({ fechaFin }: { fechaFin: string | null }) {
  if (!fechaFin) return null;
  const dias = Math.ceil((new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return <span className="text-[10px] text-[#ba1a1a]">Hace {Math.abs(dias)}d</span>;
  if (dias <= 7) return <span className="text-[10px] font-semibold text-[#735c00]">{dias}d restantes</span>;
  return null;
}

function DocCell({ fechaFin }: { fechaFin: string | null }) {
  const status = getDocStatus(fechaFin);
  const { label, variant } = docStatusConfig[status];
  return (
    <div className="flex flex-col gap-1">
      <Badge variant={variant}>{label}</Badge>
      {fechaFin && <span className="text-xs text-[#7f7663]">{fmtDate(fechaFin)}</span>}
      <DiasTag fechaFin={fechaFin} />
    </div>
  );
}

export default function MotosView({ initialMotos }: { initialMotos: Moto[] }) {
  const [motos, setMotos] = useState<Moto[]>(initialMotos);
  const [search, setSearch] = useState("");
  const [selectedPlacas, setSelectedPlacas] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<null | "new" | Moto>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "activas" | "inactivas">("todas");

  function togglePlaca(placa: string) {
    setSelectedPlacas(prev => {
      const next = new Set(prev);
      if (next.has(placa)) next.delete(placa); else next.add(placa);
      return next;
    });
  }

  function clearSearch() {
    setSearch("");
    setSelectedPlacas(new Set());
  }

  const stats = useMemo(() => {
    const activas = motos.filter(m => m.isActive);
    const porVencer = activas.filter(m =>
      getDocStatus(m.fechaFinTecno) === "por-vencer" ||
      getDocStatus(m.fechaFinSeguro) === "por-vencer"
    ).length;
    const vencidos = activas.filter(m =>
      getDocStatus(m.fechaFinTecno) === "vencido" ||
      getDocStatus(m.fechaFinSeguro) === "vencido"
    ).length;
    return { total: motos.length, activas: activas.length, porVencer, vencidos };
  }, [motos]);

  const porFiltroEstado = useMemo(() =>
    motos.filter(m => filtro === "todas" ? true : filtro === "activas" ? m.isActive : !m.isActive),
    [motos, filtro]
  );

  const chipPlacas = useMemo(() =>
    porFiltroEstado
      .map(m => m.placa)
      .filter(p => !search || p.toLowerCase().includes(search.toLowerCase())),
    [porFiltroEstado, search]
  );

  const filtered = useMemo(() => {
    if (selectedPlacas.size > 0) return porFiltroEstado.filter(m => selectedPlacas.has(m.placa));
    if (search) return porFiltroEstado.filter(m => m.placa.toLowerCase().includes(search.toLowerCase()));
    return porFiltroEstado;
  }, [porFiltroEstado, search, selectedPlacas]);

  async function handleToggle(moto: Moto) {
    setToggling(moto.id);
    const res = await fetch(`/api/motos/${moto.id}/toggle`, { method: "PATCH" });
    if (res.ok) {
      const data = await res.json();
      setMotos(prev => prev.map(m => m.id === moto.id ? { ...m, ...data.moto } : m));
    }
    setToggling(null);
  }

  function handleSaved(saved: Moto) {
    setMotos(prev => {
      const idx = prev.findIndex(m => m.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModal(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total motos" value={stats.total} icon="two_wheeler" />
        <StatCard label="Activas" value={stats.activas} icon="check_circle" />
        <StatCard
          label="Por vencer"
          value={stats.porVencer}
          icon="warning"
          variant={stats.porVencer > 0 ? "gold" : "white"}
        />
        <StatCard label="Con vencidos" value={stats.vencidos} icon="error" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Input de texto */}
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7f7663] pointer-events-none"
                style={{ fontSize: "1.125rem" }}
              >
                search
              </span>
              <input
                className="input pl-9 pr-8 w-44"
                placeholder="Buscar placa..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedPlacas(new Set()); }}
              />
              {(search || selectedPlacas.size > 0) && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7f7663] hover:text-[#1c1b1b] transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
                </button>
              )}
            </div>

            {/* Filtro estado */}
            <div className="flex items-center bg-[#f0eded] rounded-full p-1 gap-0.5">
              {(["todas", "activas", "inactivas"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    filtro === f
                      ? "bg-white text-[#735c00] shadow-sm"
                      : "text-[#7f7663] hover:text-[#1c1b1b]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button icon="add" onClick={() => setModal("new")}>
            Registrar moto
          </Button>
        </div>

        {/* Chips de placas */}
        {chipPlacas.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#7f7663] font-semibold shrink-0">Placas:</span>
            {chipPlacas.map(placa => {
              const selected = selectedPlacas.has(placa);
              return (
                <button
                  key={placa}
                  onClick={() => togglePlaca(placa)}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider border transition-all ${
                    selected
                      ? "bg-[#735c00] text-white border-[#735c00] shadow-sm"
                      : "bg-white text-[#735c00] border-[#d4af37]/50 hover:border-[#735c00] hover:bg-[#d4af37]/10"
                  }`}
                >
                  {placa}
                  {selected && (
                    <span className="ml-1 opacity-70">×</span>
                  )}
                </button>
              );
            })}
            {selectedPlacas.size > 0 && (
              <button
                onClick={() => setSelectedPlacas(new Set())}
                className="text-xs text-[#7f7663] hover:text-[#ba1a1a] underline underline-offset-2 transition-colors"
              >
                limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="two_wheeler"
          title={search ? "Sin resultados" : "Sin motos registradas"}
          description={search ? "Intenta con otra placa" : "Registra las motos del parque para gestionar sus documentos"}
          action={
            !search ? (
              <Button icon="add" onClick={() => setModal("new")}>
                Registrar moto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr>
                <th className="table-header-cell">Placa</th>
                <th className="table-header-cell">Tecnomecánica</th>
                <th className="table-header-cell">Seguro SOAT</th>
                <th className="table-header-cell">Pico y placa</th>
                <th className="table-header-cell">Estado</th>
                <th className="table-header-cell w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(moto => (
                <tr key={moto.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <p className="font-bold tracking-widest text-[#1c1b1b] text-base">{moto.placa}</p>
                      {moto.notas && (
                        <p className="text-xs text-[#7f7663] mt-0.5 max-w-[180px] truncate">{moto.notas}</p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <DocCell fechaFin={moto.fechaFinTecno} />
                  </td>
                  <td className="table-cell">
                    <DocCell fechaFin={moto.fechaFinSeguro} />
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-[#7f7663]">{moto.picoYPlaca ?? "—"}</span>
                  </td>
                  <td className="table-cell">
                    <Badge variant={moto.isActive ? "success" : "neutral"}>
                      {moto.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal(moto)}
                        className="p-2 rounded-xl hover:bg-[#f0eded] transition-colors text-[#7f7663] hover:text-[#1c1b1b]"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>edit</span>
                      </button>
                      <button
                        onClick={() => handleToggle(moto)}
                        disabled={toggling === moto.id}
                        className="p-2 rounded-xl hover:bg-[#f0eded] transition-colors text-[#7f7663] hover:text-[#1c1b1b] disabled:opacity-40"
                        title={moto.isActive ? "Desactivar" : "Activar"}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1.25rem", fontVariationSettings: moto.isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {moto.isActive ? "toggle_on" : "toggle_off"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MotoFormModal
          moto={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

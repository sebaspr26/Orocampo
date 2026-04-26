"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface DomiciliarioLocation {
  userId: string;
  name: string;
  location: { lat: number; lng: number; createdAt: string } | null;
}

interface HistoryPoint {
  lat: number;
  lng: number;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

export default function TrackingView() {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null);
  const [locations, setLocations] = useState<DomiciliarioLocation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [settings, setSettings] = useState({ horarioInicio: "07:00", horarioFin: "17:00" });
  const [editingSettings, setEditingSettings] = useState(false);
  const leafletLoaded = useRef(false);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/location/all");
      const data = await res.json();
      setLocations(data.locations ?? []);
    } catch {}
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/location/${userId}/history`);
      const data = await res.json();
      setHistory(data.history ?? []);
      setSelectedUser(userId);
    } catch {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/location/settings");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch {}
  }, []);

  const saveSettings = async () => {
    try {
      await fetch("/api/location/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setEditingSettings(false);
    } catch {}
  };

  // Load leaflet from CDN
  useEffect(() => {
    if (leafletLoaded.current) return;
    leafletLoaded.current = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initMap();
    document.head.appendChild(script);

    function initMap() {
      if (!mapRef.current || mapInstance.current) return;
      const L = (window as any).L;
      const map = L.map(mapRef.current).setView([4.6097, -74.0817], 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      mapInstance.current = map;
    }

    return () => {
      link.remove();
      script.remove();
    };
  }, []);

  // Polling
  useEffect(() => {
    fetchLocations();
    fetchSettings();
    const interval = setInterval(fetchLocations, 10_000);
    return () => clearInterval(interval);
  }, [fetchLocations, fetchSettings]);

  // Update markers
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstance.current;
    if (!L || !map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      if (!loc.location) return;
      const isSelected = selectedUser === loc.userId;
      const marker = L.marker([loc.location.lat, loc.location.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
            <div style="background:${isSelected ? "#735c00" : "#fff"};color:${isSelected ? "#fff" : "#1c1b1b"};padding:4px 10px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:12px;font-weight:700;white-space:nowrap;text-align:center">
              ${loc.name?.split(" ")[0] ?? "?"}
              <div style="font-size:9px;font-weight:400;color:${isSelected ? "rgba(255,255,255,0.7)" : "#7f7663"}">${timeAgo(loc.location!.createdAt)}</div>
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${isSelected ? "#735c00" : "#fff"}"></div>
          </div>`,
          iconSize: [100, 50],
          iconAnchor: [50, 50],
        }),
      }).addTo(map);

      marker.on("click", () => fetchHistory(loc.userId));
      markersRef.current.push(marker);
    });

    const withLoc = locations.filter((l) => l.location);
    if (withLoc.length && !selectedUser) {
      const bounds = L.latLngBounds(withLoc.map((l) => [l.location!.lat, l.location!.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, selectedUser, fetchHistory]);

  // Draw route history
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstance.current;
    if (!L || !map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (history.length > 1 && selectedUser) {
      const points: [number, number][] = history.map((h) => [h.lat, h.lng]);
      polylineRef.current = L.polyline(points, { color: "#735c00", weight: 3 }).addTo(map);
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [history, selectedUser]);

  const withLocation = locations.filter((l) => l.location);
  const selectedName = locations.find((l) => l.userId === selectedUser)?.name;

  return (
    <div className="flex flex-col gap-4">
      {/* Configuración horario */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-[#1c1b1b]/[0.06]">
        <span className="material-symbols-outlined text-[#735c00]" style={{ fontSize: "1.25rem" }}>schedule</span>
        <span className="text-sm font-semibold text-[#1c1b1b]">Horario laboral:</span>
        {editingSettings ? (
          <>
            <input
              type="time"
              value={settings.horarioInicio}
              onChange={(e) => setSettings({ ...settings, horarioInicio: e.target.value })}
              className="input text-sm py-1 px-2 w-28"
            />
            <span className="text-[#7f7663]">a</span>
            <input
              type="time"
              value={settings.horarioFin}
              onChange={(e) => setSettings({ ...settings, horarioFin: e.target.value })}
              className="input text-sm py-1 px-2 w-28"
            />
            <button onClick={saveSettings} className="btn btn-sm text-sm">Guardar</button>
            <button onClick={() => setEditingSettings(false)} className="text-sm text-[#7f7663] hover:text-[#1c1b1b]">Cancelar</button>
          </>
        ) : (
          <>
            <span className="text-sm text-[#1c1b1b]">{settings.horarioInicio} — {settings.horarioFin}</span>
            <button onClick={() => setEditingSettings(true)} className="text-sm text-[#735c00] font-semibold hover:underline">Editar</button>
          </>
        )}
      </div>

      {/* Info selección */}
      {selectedUser && (
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#1c1b1b]/[0.06]">
          <span className="material-symbols-outlined text-[#735c00]" style={{ fontSize: "1.25rem" }}>route</span>
          <span className="text-sm font-semibold text-[#1c1b1b]">Ruta de {selectedName}</span>
          <span className="text-xs text-[#7f7663]">{history.length} puntos</span>
          <button
            onClick={() => { setSelectedUser(null); setHistory([]); }}
            className="ml-auto text-[#7f7663] hover:text-[#1c1b1b]"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>close</span>
          </button>
        </div>
      )}

      {/* Mapa */}
      <div className="relative rounded-[2rem] overflow-hidden border border-[#1c1b1b]/[0.06] bg-white" style={{ height: "65vh" }}>
        <div ref={mapRef} className="w-full h-full" />
        {withLocation.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center p-8">
              <span className="material-symbols-outlined text-[#7f7663] mb-3" style={{ fontSize: "3rem" }}>location_off</span>
              <p className="font-bold text-[#1c1b1b]">Sin ubicaciones activas</p>
              <p className="text-sm text-[#7f7663] mt-1">Los domiciliarios aparecen cuando estan en horario laboral</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista domiciliarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {locations.map((loc) => (
          <button
            key={loc.userId}
            onClick={() => loc.location && fetchHistory(loc.userId)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              selectedUser === loc.userId
                ? "bg-[#735c00]/[0.08] border-[#735c00]/30"
                : "bg-white border-[#1c1b1b]/[0.06] hover:border-[#735c00]/20"
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${loc.location ? "bg-green-500" : "bg-[#1c1b1b]/20"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1c1b1b] truncate">{loc.name ?? "Sin nombre"}</p>
              <p className="text-xs text-[#7f7663]">
                {loc.location ? timeAgo(loc.location.createdAt) : "Sin datos"}
              </p>
            </div>
            {loc.location && (
              <span className="material-symbols-outlined text-[#735c00]" style={{ fontSize: "1.125rem" }}>chevron_right</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

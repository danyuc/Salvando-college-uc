"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function colorForPm25(pm25: number) {
  if (pm25 < 12) return "#22c55e";
  if (pm25 < 16) return "#facc15";
  if (pm25 < 25) return "#fb923c";
  return "#ef4444";
}

const pulseIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:999px;background:#22d3ee;border:4px solid white;box-shadow:0 0 28px rgba(34,211,238,.9);"></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function LeafletEnvironmentalMap({
  points,
  externalIndex,
}: {
  points: any[]
  externalIndex?: number
}) {
  const cleanPoints = useMemo(
    () =>
      points
        .filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
        .map((p) => ({
          ...p,
          lat: Number(p.lat),
          lng: Number(p.lng),
          pm25: Number(p.pm25 || 0),
        })),
    [points]
  );

  const coords = cleanPoints.map((p) => [p.lat, p.lng]) as [number, number][];
  const center = coords[0] ?? ([-33.49664, -70.61014] as [number, number]);

  const [internalIndex, setInternalIndex] = useState(0);

const index =
  typeof externalIndex === "number"
    ? externalIndex
    : internalIndex;
  const [playing, setPlaying] = useState(false);
  const [showHeat, setShowHeat] = useState(true);

  useEffect(() => {
    if (!playing || cleanPoints.length === 0) return;

    const interval = window.setInterval(() => {
      setInternalIndex((current) => {
        if (current >= cleanPoints.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [playing, cleanPoints.length]);

  if (cleanPoints.length === 0) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-400">
        Sube un CSV para visualizar el mapa ambiental.
      </div>
    );
  }

  return (
    <div className="relative h-[560px] overflow-hidden rounded-3xl border border-white/10">
      <div className="absolute left-4 top-4 z-[1000] flex flex-wrap gap-2">
        <button onClick={() => setPlaying(true)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">Animar</button>
        <button onClick={() => setPlaying(false)} className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white">Pausar</button>
        <button onClick={() => { setPlaying(false); setInternalIndex(0); }} className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white">Reiniciar</button>
        <button onClick={() => setShowHeat((v) => !v)} className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white">Heatmap</button>
      </div>

      <MapContainer center={center} zoom={18} className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <AutoFit coords={coords} />

        <Polyline positions={coords} pathOptions={{ color: "#2563eb", weight: 5 }} />
        <Polyline positions={coords.slice(0, index + 1)} pathOptions={{ color: "#22d3ee", weight: 8 }} />

        {showHeat &&
          cleanPoints.map((p) => (
            <Circle
              key={`heat-${p.id ?? p.sample_number}`}
              center={[p.lat, p.lng]}
              radius={6 + p.pm25 * 1.7}
              pathOptions={{
                color: colorForPm25(p.pm25),
                fillColor: colorForPm25(p.pm25),
                fillOpacity: 0.24,
                weight: 1,
              }}
            />
          ))}

        {cleanPoints.map((p) => (
          <CircleMarker
            key={`point-${p.id ?? p.sample_number}`}
            center={[p.lat, p.lng]}
            radius={5}
            pathOptions={{
              color: "#0f172a",
              fillColor: colorForPm25(p.pm25),
              fillOpacity: 1,
              weight: 1,
            }}
          >
            <Popup>
              <strong>Muestra {p.sample_number}</strong>
              <br />
              PM2.5: {p.pm25} µg/m³
              <br />
              Humedad: {p.humidity}%
              <br />
              Temperatura: {p.temperature}°C
              <br />
              Tramo: {p.tramo || "Sin clasificar"}
            </Popup>
          </CircleMarker>
        ))}

        <Marker position={[cleanPoints[index].lat, cleanPoints[index].lng]} icon={pulseIcon}>
          <Popup>
            Punto actual: {cleanPoints[index].sample_number}
            <br />
            PM2.5: {cleanPoints[index].pm25} µg/m³
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

function AutoFit({ coords }: { coords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 1) map.fitBounds(coords, { padding: [60, 60] });
  }, [coords, map]);

  return null;
}

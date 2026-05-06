"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function colorForPm25(pm25: number) {
  if (pm25 <= 12) return "#22c55e";
  if (pm25 <= 35) return "#eab308";
  if (pm25 <= 55) return "#f97316";
  if (pm25 <= 150) return "#ef4444";
  return "#7f1d1d";
}

const pulseIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:999px;background:#22d3ee;border:4px solid white;box-shadow:0 0 34px rgba(34,211,238,.95);"></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function LeafletEnvironmentalMap({
  points,
  externalIndex,
  onSelectPoint,
}: {
  points: any[];
  externalIndex?: number;
  onSelectPoint?: (index: number) => void;
}) {
  const cleanPoints = useMemo(
    () =>
      points
        .filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
        .map((p, i) => ({
          ...p,
          sample_number: p.sample_number ?? i + 1,
          lat: Number(p.lat),
          lng: Number(p.lng),
          pm25: Number(p.pm25 || 0),
          humidity: Number(p.humidity || 0),
          temperature: Number(p.temperature || p.temp || 0),
          db: Number(p.db || 0),
          cfu: Number(p.cfu || 0),
        })),
    [points]
  );

  const [internalIndex, setInternalIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showHeat, setShowHeat] = useState(true);

  const index =
    typeof externalIndex === "number"
      ? Math.min(externalIndex, Math.max(cleanPoints.length - 1, 0))
      : internalIndex;

  const coords = cleanPoints.map((p) => [p.lat, p.lng]) as [number, number][];
  const center = coords[0] ?? ([-33.4994, -70.6158] as [number, number]);

  useEffect(() => {
    if (typeof externalIndex === "number") return;
    if (!playing || cleanPoints.length === 0) return;

    const interval = window.setInterval(() => {
      setInternalIndex((current) => {
        if (current >= cleanPoints.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 850);

    return () => window.clearInterval(interval);
  }, [playing, cleanPoints.length, externalIndex]);

  if (cleanPoints.length === 0) {
    return (
      <div className="flex h-[620px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-400">
        Sin puntos para visualizar.
      </div>
    );
  }

  const current = cleanPoints[index] ?? cleanPoints[0];

  return (
    <div className="relative h-[620px] overflow-hidden rounded-3xl border border-white/10">
      <div className="absolute left-4 top-4 z-[1000] flex flex-wrap gap-2">
        {typeof externalIndex !== "number" && (
          <>
            <button onClick={() => setPlaying(true)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">Animar</button>
            <button onClick={() => setPlaying(false)} className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white">Pausar</button>
            <button onClick={() => { setPlaying(false); setInternalIndex(0); }} className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white">Reiniciar</button>
          </>
        )}

        <button onClick={() => setShowHeat((v) => !v)} className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white">
          {showHeat ? "Ocultar heatmap" : "Ver heatmap"}
        </button>
      </div>

      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <AutoFit coords={coords} current={[current.lat, current.lng]} />

        {showHeat && <HeatLayer points={cleanPoints} />}

        <Polyline positions={coords} pathOptions={{ color: "#1d4ed8", weight: 5, opacity: 0.68 }} />
        <Polyline positions={coords.slice(0, index + 1)} pathOptions={{ color: "#22d3ee", weight: 8, opacity: 0.9 }} />

        {cleanPoints.map((p, i) => (
          <CircleMarker
            key={`point-${p.id ?? p.sample_number}-${i}`}
            center={[p.lat, p.lng]}
            radius={i === index ? 12 : 7}
            eventHandlers={{
              click: () => {
                setInternalIndex(i);
                onSelectPoint?.(i);
              },
            }}
            pathOptions={{
              color: i === index ? "#ffffff" : "#0f172a",
              fillColor: colorForPm25(p.pm25),
              fillOpacity: 0.95,
              weight: i === index ? 4 : 1,
            }}
          >
            <Popup>
              <strong>{p.name || `Muestra ${p.sample_number}`}</strong>
              <br />
              PM2.5: {p.pm25} µg/m³
              <br />
              Humedad: {p.humidity}%
              <br />
              Temperatura: {p.temperature}°C
              <br />
              Ruido: {p.db} dB
              <br />
              UFC: {p.cfu}
              <br />
              Tramo: {p.tramo || p.type || "Sin clasificar"}
            </Popup>
          </CircleMarker>
        ))}

        <Marker position={[current.lat, current.lng]} icon={pulseIcon}>
          <Popup>
            Actual: {current.name}
            <br />
            PM2.5: {current.pm25} µg/m³
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

function AutoFit({
  coords,
  current,
}: {
  coords: [number, number][];
  current: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(coords, { padding: [60, 60] });
    }
  }, [coords, map]);

  useEffect(() => {
    map.flyTo(current, 13, {
      animate: true,
      duration: 0.7,
    });
  }, [current, map]);

  return null;
}

function HeatLayer({ points }: { points: any[] }) {
  const map = useMap();

  useEffect(() => {
    // @ts-expect-error leaflet.heat plugin
    const heat = L.heatLayer(
      points.map((p) => [
        p.lat,
        p.lng,
        Math.max(0.15, Math.min(Number(p.pm25 || 0) / 100, 1)),
      ]),
      {
        radius: 42,
        blur: 34,
        maxZoom: 18,
        gradient: {
          0.15: "#22c55e",
          0.35: "#eab308",
          0.55: "#f97316",
          0.75: "#ef4444",
          1.0: "#7f1d1d",
        },
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

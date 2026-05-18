"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  html: `
    <div style="
      width:28px;
      height:28px;
      border-radius:9999px;
      background:rgba(14,165,233,0.35);
      border:3px solid white;
      box-shadow:0 0 0 8px rgba(14,165,233,0.22), 0 18px 40px rgba(15,23,42,0.35);
    "></div>
  `,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

type EnvironmentalPoint = {
  lat: number;
  lng: number;
  name?: string;
  sample_number?: number;
  pm25?: number;
  humidity?: number;
  temperature?: number;
  temp?: number;
  db?: number;
  cfu?: number;
  tramo?: string;
  type?: string;
};

export default function LeafletEnvironmentalMap({
  points = [],
  externalIndex,
  onSelectPoint,
}: {
  points?: EnvironmentalPoint[];
  externalIndex?: number;
  onSelectPoint?: (index: number) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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

  const coords = useMemo(
    () => cleanPoints.map((p) => [p.lat, p.lng] as [number, number]),
    [cleanPoints]
  );

  const coordsKey = useMemo(
    () => coords.map(([lat, lng]) => `${lat},${lng}`).join("|"),
    [coords]
  );

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

  useEffect(() => {
    const container = mapElementRef.current;
    if (!container || cleanPoints.length === 0) return;

    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    container.innerHTML = "";

    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    const map = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(center, 13);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    if (coords.length > 1) {
      L.polyline(coords, {
        color: "#0f172a",
        weight: 4,
        opacity: 0.75,
      }).addTo(map);

      map.fitBounds(L.latLngBounds(coords), {
        padding: [60, 60],
      });
    }

    if (showHeat && (L as unknown as { heatLayer?: Function }).heatLayer) {
      const heatLayer = (L as unknown as { heatLayer: Function }).heatLayer(
        cleanPoints.map((p) => [
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
      );

      heatLayer.addTo(map);
    }

    cleanPoints.forEach((p, i) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: i === index ? 10 : 7,
        color: i === index ? "#ffffff" : "#0f172a",
        fillColor: colorForPm25(Number(p.pm25 || 0)),
        fillOpacity: 0.95,
        weight: i === index ? 4 : 1,
      });

      marker.on("click", () => {
        setInternalIndex(i);
        onSelectPoint?.(i);
      });

      marker.bindPopup(`
        <strong>${p.name || `Muestra ${p.sample_number}`}</strong><br/>
        PM2.5: ${p.pm25} µg/m³<br/>
        Humedad: ${p.humidity}%<br/>
        Temperatura: ${p.temperature}°C<br/>
        Ruido: ${p.db} dB<br/>
        UFC: ${p.cfu}<br/>
        Tramo: ${p.tramo || p.type || "Sin clasificar"}
      `);

      marker.addTo(map);
    });

    const current = cleanPoints[index] ?? cleanPoints[0];

    if (current) {
      L.marker([current.lat, current.lng], {
        icon: pulseIcon,
      }).addTo(map);

      map.flyTo([current.lat, current.lng], 13, {
        animate: true,
        duration: 0.7,
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      map.off();
      map.remove();

      if (mapRef.current === map) {
        mapRef.current = null;
      }

      container.innerHTML = "";

      if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
        delete (container as unknown as { _leaflet_id?: number })._leaflet_id;
      }
    };
  }, [cleanPoints, coordsKey, center, coords, index, showHeat, onSelectPoint]);

  if (cleanPoints.length === 0) {
    return (
      <div className="flex h-full min-h-[460px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80 text-sm font-semibold text-slate-500">
        Sin puntos para visualizar.
      </div>
    );
  }

  const current = cleanPoints[index] ?? cleanPoints[0];

  return (
    <div className="relative h-full min-h-[460px] overflow-hidden rounded-[2rem] border border-white/40 bg-slate-950 shadow-2xl">
      {typeof externalIndex !== "number" && (
        <div className="absolute left-4 top-4 z-[500] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg"
          >
            Animar
          </button>

          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white shadow-lg"
          >
            Pausar
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setInternalIndex(0);
            }}
            className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white shadow-lg"
          >
            Reiniciar
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowHeat((value) => !value)}
        className="absolute right-4 top-4 z-[500] rounded-full bg-slate-950/80 px-4 py-2 text-sm font-black text-white shadow-lg"
      >
        {showHeat ? "Ocultar heatmap" : "Ver heatmap"}
      </button>

      <div ref={mapElementRef} className="h-full min-h-[460px] w-full" />

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[500] rounded-3xl border border-white/30 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
          Punto actual
        </p>

        <p className="mt-1 text-lg font-black text-slate-950">
          {current.name || `Muestra ${current.sample_number}`}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-600">
          PM2.5: {current.pm25} µg/m³ · Humedad: {current.humidity}% · Temperatura:{" "}
          {current.temperature}°C
        </p>
      </div>
    </div>
  );
}

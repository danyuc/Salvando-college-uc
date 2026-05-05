"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { parseSensorCsv } from "./parseSensorCsv";
import LeafletEnvironmentalMap from "./LeafletEnvironmentalMap";

type Props = {
  points?: any[];
  decibels?: any[];
  bacteria?: any[];
};

export default function LabAmbientalClient({
  points = [],
  decibels = [],
  bacteria = [],
}: Props) {
  const [localPoints, setLocalPoints] = useState<any[]>(points);
  const [localDecibels, setLocalDecibels] = useState<any[]>(decibels);
  const [localBacteria, setLocalBacteria] = useState<any[]>(bacteria);

  const stats = useMemo(() => {
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      avgPm25: avg(localPoints.map((p: any) => Number(p.pm25 || 0))),
      maxPm25: localPoints.length
        ? Math.max(...localPoints.map((p: any) => Number(p.pm25 || 0)))
        : 0,
      avgDb: avg(localDecibels.map((d: any) => Number(d.db_avg || 0))),
      avgBacteria: avg(
        localBacteria.map((b: any) => Number(b.bacteria_count || 0))
      ),
    };
  }, [localPoints, localDecibels, localBacteria]);

  async function uploadCsv(file: File) {
    try {
      const text = await file.text();
      const parsed = parseSensorCsv(text);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id ?? null;

      const { data: session, error: sessionError } = await supabase
        .from("environmental_sessions")
        .insert({
          user_id: userId,
          session_code: parsed[0]?.device_session ?? "sin-sesion",
          line: "L4/L5",
          route_name: "Recorrido Metro",
          started_at: parsed[0]?.recorded_at,
          ended_at: parsed[parsed.length - 1]?.recorded_at,
        })
        .select()
        .single();

      if (sessionError) {
        alert(sessionError.message);
        return;
      }

      const rows = parsed.map((p) => ({
        ...p,
        user_id: userId,
        session_id: session.id,
        line: "L4/L5",
        tramo_type: "Desconocido",
        tramo: "Sin clasificar",
      }));

      const { data, error } = await supabase
        .from("environmental_points")
        .insert(rows)
        .select();

      if (error) {
        alert(error.message);
        return;
      }

      setLocalPoints((prev) => [...prev, ...(data ?? [])]);
      alert("CSV cargado correctamente");
    } catch (error: any) {
      alert(error.message ?? "Error al cargar CSV");
    }
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(localPoints),
      "PM25"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(localDecibels),
      "Decibeles"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(localBacteria),
      "Bacterias"
    );

    XLSX.writeFile(wb, "metro_ambiental.xlsx");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="font-semibold text-cyan-300">Pestaña privada</p>
        <h1 className="text-3xl font-black">Laboratorio Ambiental Metro</h1>
        <p className="mt-2 text-slate-400">
          PM2.5, bacterias, decibeles, mapa y exportación Excel.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric title="Promedio PM2.5" value={`${stats.avgPm25.toFixed(2)} µg/m³`} />
        <Metric title="Pico PM2.5" value={`${stats.maxPm25.toFixed(2)} µg/m³`} />
        <Metric title="Promedio dB" value={`${stats.avgDb.toFixed(2)} dB`} />
        <Metric title="Promedio bacterias" value={`${stats.avgBacteria.toFixed(2)} UFC`} />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-2xl bg-white px-5 py-3 font-bold text-slate-950">
          Subir CSV del sensor
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadCsv(file);
            }}
          />
        </label>

        <button
          onClick={exportExcel}
          className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Descargar Excel
        </button>
      </div>

      <LeafletEnvironmentalMap points={localPoints} />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

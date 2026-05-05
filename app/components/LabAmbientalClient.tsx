"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseSensorCsv } from "./parseSensorCsv";
import LeafletEnvironmentalMap from "./LeafletEnvironmentalMap";

type DecibelSample = {
  line: string;
  station_from: string;
  station_to: string;
  tramo_type: string;
  db_start: number;
  db_middle: number;
  db_end: number;
  db_peak: number;
};

type BacteriaSample = {
  sample_code: string;
  line: string;
  station_from: string;
  station_to: string;
  tramo_type: string;
  sample_location: string;
  exposure_minutes: number;
  bacteria_count: number;
};

export default function LabAmbientalClient() {
  const [points, setPoints] = useState<any[]>([]);
  const [decibels, setDecibels] = useState<DecibelSample[]>([]);
  const [bacteria, setBacteria] = useState<BacteriaSample[]>([]);

  const stats = useMemo(() => {
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const pm = points.map((p) => Number(p.pm25 || 0));
    const hum = points.map((p) => Number(p.humidity || 0));
    const temp = points.map((p) => Number(p.temperature || 0));

    const dbAvgs = decibels.map(
      (d) => (Number(d.db_start) + Number(d.db_middle) + Number(d.db_end)) / 3
    );

    const bacteriaCounts = bacteria.map((b) => Number(b.bacteria_count || 0));

    return {
      samples: points.length,
      avgPm25: avg(pm),
      maxPm25: pm.length ? Math.max(...pm) : 0,
      minPm25: pm.length ? Math.min(...pm) : 0,
      avgHumidity: avg(hum),
      avgTemp: avg(temp),
      avgDb: avg(dbAvgs),
      maxDb: decibels.length ? Math.max(...decibels.map((d) => Number(d.db_peak || 0))) : 0,
      avgBacteria: avg(bacteriaCounts),
      maxBacteria: bacteriaCounts.length ? Math.max(...bacteriaCounts) : 0,
    };
  }, [points, decibels, bacteria]);

  const chartData = useMemo(
    () =>
      points.map((p, i) => ({
        muestra: p.sample_number ?? i + 1,
        pm25: Number(p.pm25 || 0),
        humedad: Number(p.humidity || 0),
        temperatura: Number(p.temperature || 0),
        bateria: Number(p.battery || 0),
      })),
    [points]
  );

  const tramoRanking = useMemo(() => {
    const grouped = new Map<string, number[]>();

    points.forEach((p) => {
      const key = p.tramo || "Sin clasificar";
      grouped.set(key, [...(grouped.get(key) ?? []), Number(p.pm25 || 0)]);
    });

    return [...grouped.entries()]
      .map(([tramo, values]) => ({
        tramo,
        promedio: values.reduce((a, b) => a + b, 0) / values.length,
        peak: Math.max(...values),
        muestras: values.length,
      }))
      .sort((a, b) => b.promedio - a.promedio);
  }, [points]);

  const tipoRanking = useMemo(() => {
    const grouped = new Map<string, number[]>();

    points.forEach((p) => {
      const key = p.tramo_type || "Desconocido";
      grouped.set(key, [...(grouped.get(key) ?? []), Number(p.pm25 || 0)]);
    });

    return [...grouped.entries()].map(([tipo, values]) => ({
      tipo,
      promedio: values.reduce((a, b) => a + b, 0) / values.length,
      muestras: values.length,
    }));
  }, [points]);

  const dbChart = useMemo(
    () =>
      decibels.map((d) => ({
        tramo: `${d.station_from} → ${d.station_to}`,
        inicio: Number(d.db_start),
        mitad: Number(d.db_middle),
        final: Number(d.db_end),
        peak: Number(d.db_peak),
        promedio: (Number(d.db_start) + Number(d.db_middle) + Number(d.db_end)) / 3,
      })),
    [decibels]
  );

  const bacteriaChart = useMemo(
    () =>
      bacteria.map((b) => ({
        muestra: b.sample_code,
        tramo: `${b.station_from} → ${b.station_to}`,
        bacterias: Number(b.bacteria_count),
      })),
    [bacteria]
  );

  async function uploadCsv(file: File) {
    const text = await file.text();
    const parsed = parseSensorCsv(text);
    setPoints((prev) => [...prev, ...parsed]);
  }

  function addDecibel(formData: FormData) {
    const item: DecibelSample = {
      line: String(formData.get("line")),
      station_from: String(formData.get("station_from")),
      station_to: String(formData.get("station_to")),
      tramo_type: String(formData.get("tramo_type")),
      db_start: Number(formData.get("db_start")),
      db_middle: Number(formData.get("db_middle")),
      db_end: Number(formData.get("db_end")),
      db_peak: Number(formData.get("db_peak")),
    };

    setDecibels((prev) => [item, ...prev]);
  }

  function addBacteria(formData: FormData) {
    const item: BacteriaSample = {
      sample_code: String(formData.get("sample_code")),
      line: String(formData.get("line")),
      station_from: String(formData.get("station_from")),
      station_to: String(formData.get("station_to")),
      tramo_type: String(formData.get("tramo_type")),
      sample_location: String(formData.get("sample_location")),
      exposure_minutes: Number(formData.get("exposure_minutes")),
      bacteria_count: Number(formData.get("bacteria_count")),
    };

    setBacteria((prev) => [item, ...prev]);
  }


  const scientificSummary = useMemo(() => {
    const pmText =
      stats.avgPm25 > 25
        ? "alta"
        : stats.avgPm25 > 12
        ? "moderada"
        : "baja";

    return {
      title: "Resumen científico preliminar",
      hypothesis:
        "Se evalúa si los tramos subterráneos, elevados y de transición presentan diferencias ambientales medibles en PM2.5, ruido y carga bacteriana.",
      result: `La concentración promedio de PM2.5 observada fue ${stats.avgPm25.toFixed(
        2
      )} µg/m³, con un peak de ${stats.maxPm25.toFixed(
        2
      )} µg/m³. Esto sugiere una exposición ${pmText} durante el recorrido medido.`,
      interpretation:
        "El análisis debe complementarse con clasificación estación a estación, mediciones de decibeles y muestras bacterianas para establecer diferencias entre superficie, subterráneo y transición.",
      limitation:
        "Los datos provienen de un sensor de bajo costo, por lo que los resultados deben interpretarse como aproximación exploratoria y no como medición oficial certificada.",
    };
  }, [stats]);

  function exportExcel() {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(points), "PM25_GPS");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(decibels), "Decibeles");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bacteria), "Bacterias");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tramoRanking), "Ranking_Tramos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tipoRanking), "Elevado_vs_Subterraneo");

    XLSX.writeFile(wb, "laboratorio_ambiental_metro_pro.xlsx");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <p className="font-black uppercase tracking-[0.22em] text-cyan-300">Modo investigación</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Laboratorio Ambiental Metro</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Análisis integrado de PM2.5, humedad, temperatura, ruido, bacterias, tramos y mapa GPS animado.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric title="Promedio PM2.5" value={`${stats.avgPm25.toFixed(2)} µg/m³`} />
        <Metric title="Peak PM2.5" value={`${stats.maxPm25.toFixed(2)} µg/m³`} />
        <Metric title="Promedio dB" value={`${stats.avgDb.toFixed(2)} dB`} />
        <Metric title="Promedio bacterias" value={`${stats.avgBacteria.toFixed(2)} UFC`} />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-2xl bg-white px-5 py-3 font-black text-slate-950">
          Subir CSV sensor
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

        <button onClick={exportExcel} className="rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950">
          Descargar Excel pro
        </button>
      </div>

      <LeafletEnvironmentalMap points={points} />


      <section className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
          Modo paper científico
        </p>
        <h2 className="mt-2 text-2xl font-black">
          {scientificSummary.title}
        </h2>
        <div className="mt-4 space-y-3 text-slate-200">
          <p><strong>Hipótesis:</strong> {scientificSummary.hypothesis}</p>
          <p><strong>Resultado preliminar:</strong> {scientificSummary.result}</p>
          <p><strong>Interpretación:</strong> {scientificSummary.interpretation}</p>
          <p><strong>Limitación metodológica:</strong> {scientificSummary.limitation}</p>
        </div>
      </section>



      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="PM2.5 por muestra">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="muestra" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pm25" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Humedad y temperatura">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="muestra" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="humedad" fillOpacity={0.25} strokeWidth={2} />
              <Area type="monotone" dataKey="temperatura" fillOpacity={0.25} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Decibeles estación a estación">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dbChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tramo" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="promedio" />
              <Bar dataKey="peak" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bacterias por muestra">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bacteriaChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="muestra" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bacterias" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FormCard title="Agregar decibeles" action={addDecibel} type="decibels" />
        <FormCard title="Agregar bacterias / hisopo" action={addBacteria} type="bacteria" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Table title="Ranking por tramo" rows={tramoRanking} />
        <Table title="Elevado vs subterráneo" rows={tipoRanking} />
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white p-5 text-slate-950">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function FormCard({ title, action, type }: any) {
  return (
    <form action={action} className="space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <input name="line" placeholder="Línea: L4, L5..." className="input" required />
      <input name="station_from" placeholder="Estación origen" className="input" required />
      <input name="station_to" placeholder="Estación destino" className="input" required />

      <select name="tramo_type" className="input" required>
        <option className="text-black">Elevado</option>
        <option className="text-black">Subterráneo</option>
        <option className="text-black">Transición</option>
        <option className="text-black">Estación</option>
      </select>

      {type === "decibels" ? (
        <>
          <input name="db_start" placeholder="dB saliendo de estación" type="number" step="0.1" className="input" required />
          <input name="db_middle" placeholder="dB mitad del tramo" type="number" step="0.1" className="input" required />
          <input name="db_end" placeholder="dB llegando a estación" type="number" step="0.1" className="input" required />
          <input name="db_peak" placeholder="Peak dB" type="number" step="0.1" className="input" required />
        </>
      ) : (
        <>
          <input name="sample_code" placeholder="Código muestra: B1, B2..." className="input" required />
          <input name="sample_location" placeholder="Lugar: vagón, andén, puerta..." className="input" required />
          <input name="exposure_minutes" placeholder="Minutos exposición" type="number" step="0.1" className="input" required />
          <input name="bacteria_count" placeholder="Cantidad revelada / UFC" type="number" step="0.1" className="input" required />
        </>
      )}

      <button className="rounded-2xl bg-white px-5 py-3 font-black text-slate-950">
        Guardar
      </button>
    </form>
  );
}

function Table({ title, rows }: { title: string; rows: any[] }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-sm text-slate-300">
        {JSON.stringify(rows, null, 2)}
      </pre>
    </div>
  );
}

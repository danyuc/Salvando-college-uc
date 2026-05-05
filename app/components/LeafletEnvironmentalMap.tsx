"use client";

type Props = {
  points: any[];
};

export default function LeafletEnvironmentalMap({ points }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-white">
      <h2 className="text-xl font-bold">Mapa Ambiental</h2>
      <p className="mt-2 text-slate-300">
        Mapa cargado correctamente. Puntos recibidos: {points.length}
      </p>
    </div>
  );
}

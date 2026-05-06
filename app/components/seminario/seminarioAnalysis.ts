import { SEMINARIO_SEGMENTS, type SeminarioSegmentId } from "./seminarioRoute"

export type PointLike = {
  pm25?: number | null
  humidity?: number | null
  temperature?: number | null
  segment_id?: string | null
}

export type DecibelLike = {
  segment_id?: string | null
  db_exit?: number | null
  db_mid?: number | null
  db_arrival?: number | null
  db_peak?: number | null
}

export type BacteriaLike = {
  segment_id?: string | null
  cfu_count?: number | null
}

function clean(values: Array<number | null | undefined>) {
  return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
}

export function avg(values: Array<number | null | undefined>) {
  const valid = clean(values)
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export function max(values: Array<number | null | undefined>) {
  const valid = clean(values)
  if (!valid.length) return null
  return Math.max(...valid)
}

export function buildSegmentAnalysis(points: PointLike[], decibels: DecibelLike[], bacteria: BacteriaLike[]) {
  return SEMINARIO_SEGMENTS.map((segment) => {
    const segmentPoints = points.filter((point) => point.segment_id === segment.id)
    const segmentDecibels = decibels.filter((sample) => sample.segment_id === segment.id)
    const segmentBacteria = bacteria.filter((sample) => sample.segment_id === segment.id)

    const dbValues = segmentDecibels.flatMap((sample) => [
      sample.db_exit,
      sample.db_mid,
      sample.db_arrival,
      sample.db_peak,
    ])

    return {
      ...segment,
      label: `${segment.origin} → ${segment.destination}`,
      pm25Avg: avg(segmentPoints.map((point) => point.pm25)),
      pm25Peak: max(segmentPoints.map((point) => point.pm25)),
      humidityAvg: avg(segmentPoints.map((point) => point.humidity)),
      temperatureAvg: avg(segmentPoints.map((point) => point.temperature)),
      dbAvg: avg(dbValues),
      dbPeak: max(segmentDecibels.map((sample) => sample.db_peak)),
      cfuAvg: avg(segmentBacteria.map((sample) => sample.cfu_count)),
      cfuPeak: max(segmentBacteria.map((sample) => sample.cfu_count)),
      pointsCount: segmentPoints.length,
      dbCount: segmentDecibels.length,
      bacteriaCount: segmentBacteria.length,
    }
  })
}

export function autoSegmentByOrder(index: number, total: number): SeminarioSegmentId {
  if (total <= 0) return "sj-vv"
  const ratio = index / total

  if (ratio < 0.2) return "sj-vv"
  if (ratio < 0.4) return "vv-tr"
  if (ratio < 0.6) return "tr-pe"
  if (ratio < 0.8) return "pe-vv"
  return "vv-sj"
}

export function buildPaperText(summary: ReturnType<typeof buildSegmentAnalysis>) {
  const elevated = summary.filter((row) => row.type === "elevated")
  const underground = summary.filter((row) => row.type === "subterranean")
  const transition = summary.filter((row) => row.type === "transition")

  const elevatedPm = avg(elevated.map((row) => row.pm25Avg))
  const undergroundPm = avg(underground.map((row) => row.pm25Avg))
  const transitionPm = avg(transition.map((row) => row.pm25Avg))

  return {
    hypothesis:
      "El estudio compara tramos elevados, subterráneos y de transición del recorrido San Joaquín → Vicente Valdés → Trinidad → Plaza Egaña y regreso, evaluando PM2.5, humedad, temperatura, ruido y bacterias/UFC.",
    preliminary:
      `El promedio preliminar de PM2.5 en tramos elevados es ${elevatedPm?.toFixed(1) ?? "—"} µg/m³, en tramos subterráneos ${undergroundPm?.toFixed(1) ?? "—"} µg/m³ y en transición ${transitionPm?.toFixed(1) ?? "—"} µg/m³.`,
    interpretation:
      "Las diferencias observadas pueden relacionarse con ventilación, apertura del trazado, flujo de pasajeros, material particulado acumulado, interacción con vías de transporte exteriores y condiciones propias de cada estación.",
    limitations:
      "Los resultados deben interpretarse como exploratorios: dependen de horario, número de muestras, calibración del sensor, ubicación del dispositivo, técnica de hisopado y tiempo de exposición microbiológica.",
  }
}

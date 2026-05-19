import {
  CRSH_SENSORS,
  buildDemoReading,
  type CrshSensor,
  type SensorReading,
} from "./cardenal-respira"

export type LiveSensorFetchResult =
  | { ok: true; reading: SensorReading }
  | { ok: false; reason: string; fallback: SensorReading }

export async function fetchValidatedSensorReading(sensor: CrshSensor): Promise<LiveSensorFetchResult> {
  // No stable JSON/API endpoint is currently configured for sensor.aireciudadano.com.
  // This adapter intentionally avoids scraping Grafana/HTML. When a validated endpoint
  // is available, normalize it into SensorReading here.
  return {
    ok: false,
    reason: "No hay endpoint live validado configurado; usando demo/manual/fallback.",
    fallback: buildDemoReading(sensor),
  }
}

export function getSensorById(sensorId: string) {
  return CRSH_SENSORS.find((sensor) => sensor.id === sensorId) ?? CRSH_SENSORS[0]
}

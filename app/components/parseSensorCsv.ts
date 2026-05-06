import Papa from "papaparse"

export type SensorPoint = {
  sample_number: number
  device_session: string
  raw_timestamp: number
  recorded_at: string | null
  lat: number | null
  lng: number | null
  battery: number | null
  pm25: number | null
  humidity: number | null
  temperature: number | null
  valid_session: boolean
  cache_status: string | null
}

function get(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== "") {
      return row[name]
    }
  }
  return null
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null
  const clean = String(value).trim().replace(",", ".")
  const number = Number(clean)
  return Number.isFinite(number) ? number : null
}

function toBoolean(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase()
  return ["1", "true", "sí", "si", "yes", "valid", "válida", "valida"].includes(text)
}

function unixToIso(value: unknown) {
  const n = toNumber(value)
  if (!n) return null
  const ms = n > 9999999999 ? n : n * 1000
  const date = new Date(ms)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function parseSensorCsv(file: File): Promise<SensorPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message))
          return
        }

        const rows = results.data

        const parsed = rows
          .map((row, index) => {
            const timestamp = get(row, ["Fecha/Hora", "Fecha Hora", "timestamp", "Timestamp"])
            const lat = toNumber(get(row, ["Latitud", "lat", "latitude"]))
            const lng = toNumber(get(row, ["Longitud", "lng", "lon", "longitude"]))

            return {
              sample_number: toNumber(get(row, ["ID", "id"])) ?? index + 1,
              device_session: String(get(row, ["Sesión", "Sesion", "session"]) ?? ""),
              raw_timestamp: toNumber(timestamp) ?? 0,
              recorded_at: unixToIso(timestamp),
              lat,
              lng,
              battery: toNumber(get(row, ["Batería", "Bateria", "battery"])),
              pm25: toNumber(get(row, ["PM2.5", "pm25", "PM25"])),
              humidity: toNumber(get(row, ["Humedad", "humidity"])),
              temperature: toNumber(get(row, ["Temperatura", "temperature"])),
              valid_session: toBoolean(get(row, ["Sesión Válida", "Sesion Valida", "valid_session"])),
              cache_status: String(get(row, ["Esta en Cache", "Cache", "cache_status"]) ?? ""),
            }
          })
          .filter((point) => point.lat !== null && point.lng !== null)

        resolve(parsed)
      },
      error(error) {
        reject(error)
      },
    })
  })
}

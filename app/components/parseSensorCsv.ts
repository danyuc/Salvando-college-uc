import Papa from "papaparse";

export type SensorPoint = {
  sample_number: number;
  device_session: string;
  raw_timestamp: number;
  recorded_at: string;
  lat: number;
  lng: number;
  battery: number;
  pm25: number;
  humidity: number;
  temperature: number;
  valid_session: boolean;
  cache_status: string;
};

function unixToIso(value: string | number) {
  const n = Number(value);
  const ms = n > 9999999999 ? n : n * 1000;
  return new Date(ms).toISOString();
}

export function parseSensorCsv(fileText: string): SensorPoint[] {
  const parsed = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message);
  }

  return parsed.data.map((row) => ({
    sample_number: Number(row["ID"]),
    device_session: row["Sesión"],
    raw_timestamp: Number(row["Fecha/Hora"]),
    recorded_at: unixToIso(row["Fecha/Hora"]),
    lat: Number(row["Latitud"]),
    lng: Number(row["Longitud"]),
    battery: Number(row["Batería"]),
    pm25: Number(row["PM2.5"]),
    humidity: Number(row["Humedad"]),
    temperature: Number(row["Temperatura"]),
    valid_session:
      row["Sesión Válida"] === "1" ||
      row["Sesión Válida"]?.toLowerCase() === "true",
    cache_status: row["Esta en Cache"] ?? "No",
  }));
}

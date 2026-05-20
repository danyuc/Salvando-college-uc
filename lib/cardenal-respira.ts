import { ACCESS_CODES } from "./access-control"

export type SensorStatus = "live" | "demo" | "manual" | "pending" | "offline"
export type AirQualityColor = "green" | "yellow" | "orange" | "red" | "purple"
export type AirQualityLabel = "Bueno" | "Moderado" | "Atención" | "Alto" | "Crítico"

export type CrshSensor = {
  id: string
  name: string
  shortName: string
  location: string
  source: string
  status: SensorStatus
  dashboardUrl: string
  iframeUrl: string
  note: string
}

export type SensorReading = {
  sensorId: string
  sensorName: string
  pm25: number | null
  pm10: number | null
  temperature: number | null
  humidity: number | null
  timestamp: string
  status: SensorStatus
  sourceLabel: string
  isLive: boolean
  isDemo: boolean
  educationalInterpretation: string
  recommendedAction: string
}

export type AirQualityDemoPoint = {
  date: string
  pm25: number
  pm10: number
  temperature: number
  humidity: number
  status: AirQualityLabel
  color: AirQualityColor
  action: string
  phase: string
}

export const CARDENAL_RESPIRA_ACCESS_CODE = ACCESS_CODES.crshTeacher

export const CARDENAL_RESPIRA_DASHBOARD_URL =
  "https://sensor.aireciudadano.com/d/xTdbNb87z/general-completo?orgId=1&from=1779228228932&to=1779231828932"

export const CARDENAL_RESPIRA_PROJECT = {
  schoolName: "Colegio Bicentenario Cardenal Raúl Silva Henríquez",
  title: "Cardenal Respira",
  subtitle: "Calidad del aire, salud escolar y ciencia ciudadana",
  featuredInstitutionalNumber: 71,
  featuredInstitutionalNumberLabel: "Referencia College UC: 71",
  exploraStatus: "Explora en revisión",
  dashboardUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
}

export const CRSH_SENSORS: CrshSensor[] = [
  {
    id: "sensor-71-college-uc",
    name: "Sensor 71 · College UC",
    shortName: "Sensor 71",
    location: "Referencia College UC",
    source: "sensor.aireciudadano.com",
    status: "demo",
    dashboardUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    iframeUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    note: "Datos demostrativos hasta conectar una fuente live validada.",
  },
  {
    id: "sensor-crsh-exterior",
    name: "Sensor Cardenal Respira",
    shortName: "Exterior",
    location: "Exterior del establecimiento",
    source: "sensor.aireciudadano.com",
    status: "pending",
    dashboardUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    iframeUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    note: "Pendiente de conexión live.",
  },
  {
    id: "sensor-patio",
    name: "Sensor Patio / Sector exterior",
    shortName: "Patio",
    location: "Por definir",
    source: "sensor.aireciudadano.com",
    status: "pending",
    dashboardUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    iframeUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    note: "Pendiente de instalación o conexión.",
  },
]

export const AIR_QUALITY_DEMO_DATA: AirQualityDemoPoint[] = [
  { date: "Lunes", pm25: 12, pm10: 24, temperature: 19, humidity: 54, status: "Bueno", color: "green", action: "Comparar interior/exterior", phase: "Entrada" },
  { date: "Martes", pm25: 28, pm10: 48, temperature: 18, humidity: 61, status: "Moderado", color: "yellow", action: "Conversar sobre ventilación", phase: "Clase" },
  { date: "Miércoles", pm25: 43, pm10: 72, temperature: 17, humidity: 68, status: "Atención", color: "orange", action: "Analizar horarios y fuentes posibles", phase: "Recreo" },
  { date: "Jueves", pm25: 58, pm10: 88, temperature: 16, humidity: 73, status: "Alto", color: "red", action: "Planificar actividad educativa", phase: "Salida" },
  { date: "Viernes", pm25: 19, pm10: 36, temperature: 20, humidity: 52, status: "Bueno", color: "green", action: "Cerrar la semana con reflexión", phase: "Taller" },
]

export const AIR_QUALITY_THRESHOLDS = [
  { label: "Bueno", max: 15, color: "green", range: "0-15", action: "Comparar interior/exterior", description: "Condición favorable para conversación educativa." },
  { label: "Moderado", max: 35, color: "yellow", range: "16-35", action: "Conversar sobre ventilación", description: "Invita a observar ventilación y entorno." },
  { label: "Atención", max: 50, color: "orange", range: "36-50", action: "Analizar horarios", description: "Buen punto de partida para análisis de fuentes." },
  { label: "Alto", max: 75, color: "red", range: "51-75", action: "Planificar actividad educativa", description: "Requiere mirada pedagógica y preventiva." },
  { label: "Crítico", max: Infinity, color: "purple", range: "76+", action: "Revisar criterios institucionales", description: "Usar solo con criterios oficiales y contexto." },
] as const

export const STATUS_LABELS: Record<SensorStatus, string> = {
  live: "LIVE",
  demo: "DEMO",
  manual: "MANUAL",
  pending: "PENDING CONNECTION",
  offline: "OFFLINE",
}

export const CURRICULAR_LINKS = [
  "Ciencias Naturales",
  "Formación Ciudadana",
  "Educación Física",
  "Especialidades TP",
  "Análisis de datos",
]

export const TEACHER_MATERIALS = [
  "PM2.5 vs PM10",
  "Invierno y calidad del aire",
  "Ventilación y bienestar escolar",
  "Actividad física y ambiente",
  "Ciencia ciudadana",
  "Justicia ambiental",
]

export const CLASS_IDEAS = [
  "Actividad de 15 minutos: leer el semáforo del día y formular una hipótesis.",
  "Clase de 45 minutos: comparar PM2.5, PM10, temperatura y humedad.",
  "Proyecto TP: construir un panel, alerta o campaña educativa con datos del sensor.",
  "Feria científica: explicar cómo cambia el aire durante entrada, recreo y salida.",
]

export function getAirQualityFromPm25(pm25: number | null) {
  if (pm25 === null || !Number.isFinite(pm25)) {
    return AIR_QUALITY_THRESHOLDS[1]
  }
  return AIR_QUALITY_THRESHOLDS.find((threshold) => pm25 <= threshold.max) ?? AIR_QUALITY_THRESHOLDS[4]
}

export function buildDemoReading(sensor: CrshSensor, index = 1): SensorReading {
  const point = AIR_QUALITY_DEMO_DATA[index % AIR_QUALITY_DEMO_DATA.length]
  const threshold = getAirQualityFromPm25(point.pm25)
  return {
    sensorId: sensor.id,
    sensorName: sensor.name,
    pm25: point.pm25,
    pm10: point.pm10,
    temperature: point.temperature,
    humidity: point.humidity,
    timestamp: new Date().toISOString(),
    status: sensor.status === "pending" ? "pending" : "demo",
    sourceLabel: sensor.status === "pending" ? "Pendiente de conexión" : "Datos demostrativos para presentación",
    isLive: false,
    isDemo: sensor.status !== "pending",
    educationalInterpretation: `Tal día hubo condición ${threshold.label.toLowerCase()}; esto abre una conversación pedagógica sobre ventilación, horarios y entorno urbano.`,
    recommendedAction: threshold.action,
  }
}

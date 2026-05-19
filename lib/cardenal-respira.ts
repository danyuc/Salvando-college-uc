export type SensorStatus = "En preparación" | "Activo" | "Pendiente" | "Sin conexión"

export type CrshSensor = {
  id: string
  name: string
  location: string
  description: string
  status: SensorStatus
  dashboardUrl: string
  iframeUrl: string
}

export type AirQualityDemoPoint = {
  date: string
  pm25: number
  pm10: number
  temperature: number
  humidity: number
  status: "Bueno" | "Moderado" | "Atención" | "Alto" | "Crítico"
  color: "green" | "yellow" | "orange" | "red" | "purple"
  action: string
  phase: string
}

export const CARDENAL_RESPIRA_ACCESS_CODE = "CRSH"

export const CARDENAL_RESPIRA_DASHBOARD_URL =
  "https://sensor.aireciudadano.com/d/xTDbNb87z/general?orgId=1&refresh=1m"

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
    id: "sensor-cardenal-respira",
    name: "Sensor Cardenal Respira",
    location: "Exterior del establecimiento",
    description: "Sensor institucional para monitoreo educativo de calidad del aire.",
    status: "En preparación",
    dashboardUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    iframeUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
  },
  {
    id: "sensor-patio-exterior",
    name: "Sensor Patio / Sector exterior",
    location: "Patio o punto exterior seguro",
    description: "Punto de comparación para actividades pedagógicas y proyectos TP.",
    status: "Pendiente",
    dashboardUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
    iframeUrl: CARDENAL_RESPIRA_DASHBOARD_URL,
  },
]

export const AIR_QUALITY_DEMO_DATA: AirQualityDemoPoint[] = [
  {
    date: "Lunes",
    pm25: 12,
    pm10: 24,
    temperature: 19,
    humidity: 54,
    status: "Bueno",
    color: "green",
    action: "Comparar interior/exterior",
    phase: "Entrada",
  },
  {
    date: "Martes",
    pm25: 28,
    pm10: 48,
    temperature: 18,
    humidity: 61,
    status: "Moderado",
    color: "yellow",
    action: "Conversar sobre ventilación",
    phase: "Clase",
  },
  {
    date: "Miércoles",
    pm25: 43,
    pm10: 72,
    temperature: 17,
    humidity: 68,
    status: "Atención",
    color: "orange",
    action: "Analizar fuentes posibles",
    phase: "Recreo",
  },
  {
    date: "Jueves",
    pm25: 58,
    pm10: 88,
    temperature: 16,
    humidity: 73,
    status: "Alto",
    color: "red",
    action: "Planificar actividad educativa",
    phase: "Salida",
  },
  {
    date: "Viernes",
    pm25: 19,
    pm10: 36,
    temperature: 20,
    humidity: 52,
    status: "Bueno",
    color: "green",
    action: "Cerrar la semana con reflexión",
    phase: "Taller",
  },
]

export const AIR_QUALITY_THRESHOLDS = [
  { label: "Bueno", range: "0-15", color: "green", description: "Condición favorable para conversación educativa." },
  { label: "Moderado", range: "16-35", color: "yellow", description: "Invita a observar ventilación y entorno." },
  { label: "Atención", range: "36-50", color: "orange", description: "Buen punto de partida para análisis de fuentes." },
  { label: "Alto", range: "51-75", color: "red", description: "Requiere mirada pedagógica y preventiva." },
  { label: "Crítico", range: "76+", color: "purple", description: "Usar solo con criterios oficiales y contexto." },
] as const

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

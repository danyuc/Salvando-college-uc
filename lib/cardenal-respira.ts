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

export type ChallengeType =
  | "pm25-basico"
  | "pm10-vs-pm25"
  | "semaforo-ambiental"
  | "interpretacion-datos"
  | "decisiones-escolares"
  | "ciencia-ciudadana"
  | "tp-innovacion"
  | "sensor-71"

export type CrshChallengeQuestion = {
  id: string
  packId: ChallengeType
  packTitle: string
  prompt: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  environmentalInsightBonus?: boolean
}

export const CARDENAL_RESPIRA_ACCESS_CODE = ACCESS_CODES.crshTeacher

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

export const CRSH_SCORING = {
  correctMajority: 100,
  correctMajority70: 150,
  correctMajority90: 250,
  wrongMajority: -20,
  noVotes: 0,
  streak3: 50,
  streak5: 100,
  environmentalInsight: 50,
}

export const CRSH_BADGES = [
  "Clase en llamas",
  "Semáforo dominado",
  "Expertos PM2.5",
  "Detectives del aire",
  "Ciencia ciudadana",
  "Mejor interpretación",
  "Reto completado",
  "Racha ambiental",
]

export const CRSH_CHALLENGE_PACKS: CrshChallengeQuestion[] = [
  {
    id: "pm25-basico-1",
    packId: "pm25-basico",
    packTitle: "PM2.5 básico",
    prompt: "¿Qué mide principalmente PM2.5?",
    options: ["Partículas finas suspendidas en el aire", "Temperatura del suelo", "Cantidad de estudiantes", "Velocidad de internet"],
    correctIndex: 0,
    explanation: "PM2.5 se refiere a partículas muy pequeñas suspendidas en el aire. Son relevantes porque ayudan a observar la calidad del aire del entorno.",
  },
  {
    id: "pm25-basico-2",
    packId: "pm25-basico",
    packTitle: "PM2.5 básico",
    prompt: "¿Por qué PM2.5 puede ser difícil de percibir a simple vista?",
    options: ["Porque siempre tiene color azul", "Porque son partículas muy pequeñas", "Porque solo aparece de noche", "Porque no existe en ciudades"],
    correctIndex: 1,
    explanation: "PM2.5 corresponde a partículas pequeñas que no siempre se ven, por eso los sensores ayudan a observarlas educativamente.",
  },
  {
    id: "pm10-vs-pm25-1",
    packId: "pm10-vs-pm25",
    packTitle: "PM10 vs PM2.5",
    prompt: "¿Cuál es la diferencia principal entre PM10 y PM2.5?",
    options: ["El tamaño de las partículas", "El color del sensor", "La cantidad de cursos", "El tipo de internet"],
    correctIndex: 0,
    explanation: "La diferencia principal es el tamaño de las partículas. Compararlas ayuda a entender distintos tipos de material suspendido.",
  },
  {
    id: "pm10-vs-pm25-2",
    packId: "pm10-vs-pm25",
    packTitle: "PM10 vs PM2.5",
    prompt: "Si queremos comparar polvo más grueso con partículas más finas, ¿qué conviene mirar?",
    options: ["PM10 y PM2.5", "Solo temperatura", "Solo humedad", "Solo hora del día"],
    correctIndex: 0,
    explanation: "PM10 y PM2.5 permiten comparar tamaños de partículas y conversar sobre fuentes del entorno.",
  },
  {
    id: "semaforo-1",
    packId: "semaforo-ambiental",
    packTitle: "Semáforo ambiental",
    prompt: "Si el semáforo está en “Moderado”, ¿qué acción educativa tiene sentido?",
    options: ["Ignorar los datos", "Conversar sobre ventilación, horarios y entorno", "Apagar todos los computadores", "Cancelar toda actividad escolar"],
    correctIndex: 1,
    explanation: "Una condición moderada puede abrir conversación pedagógica sin alarmismo: ventilación, horarios, clima y entorno.",
    environmentalInsightBonus: true,
  },
  {
    id: "semaforo-2",
    packId: "semaforo-ambiental",
    packTitle: "Semáforo ambiental",
    prompt: "Si un día el PM2.5 sube respecto a otros días, ¿qué pregunta podría investigar el curso?",
    options: ["¿Cambió el horario, clima, ventilación o entorno?", "¿Cuántos lápices hay en la sala?", "¿Quién ganó el recreo?", "¿Qué color tiene el uniforme?"],
    correctIndex: 0,
    explanation: "La pregunta científica conecta el dato con posibles condiciones del día y del entorno.",
    environmentalInsightBonus: true,
  },
  {
    id: "sensor-71-1",
    packId: "sensor-71",
    packTitle: "Sensor 71 · College UC",
    prompt: "¿Qué nos permite hacer un sensor como Sensor 71?",
    options: ["Observar datos ambientales y analizarlos educativamente", "Identificar estudiantes por nombre", "Reemplazar todas las clases", "Cambiar las notas automáticamente"],
    correctIndex: 0,
    explanation: "Un sensor ambiental permite observar tendencias y convertir datos en preguntas de aprendizaje.",
  },
  {
    id: "sensor-71-2",
    packId: "sensor-71",
    packTitle: "Sensor 71 · College UC",
    prompt: "Si los datos del Sensor 71 aparecen en un dashboard, ¿qué puede hacer un docente?",
    options: ["Usarlos para interpretar tendencias y hacer preguntas de clase", "Usarlos para diagnosticar enfermedades", "Usarlos para castigar estudiantes", "Ignorarlos siempre"],
    correctIndex: 0,
    explanation: "El dashboard sirve para interpretar tendencias y generar actividades educativas. No reemplaza criterios médicos ni personales.",
  },
  {
    id: "decisiones-1",
    packId: "decisiones-escolares",
    packTitle: "Decisiones escolares",
    prompt: "¿Qué decisión educativa puede apoyar un dashboard ambiental?",
    options: ["Comparar momentos del día y conversar sobre medidas de cuidado", "Elegir el color de las paredes", "Decidir quién sale primero al recreo sin datos", "Borrar el calendario"],
    correctIndex: 0,
    explanation: "El valor escolar está en observar, comparar y conversar sobre acciones educativas informadas.",
    environmentalInsightBonus: true,
  },
  {
    id: "decisiones-2",
    packId: "decisiones-escolares",
    packTitle: "Decisiones escolares",
    prompt: "¿Por qué es importante aclarar si los datos son live, demo o manuales?",
    options: ["Para no confundir una simulación con una medición real", "Para que se vea más bonito solamente", "Para esconder información", "Para evitar usar gráficos"],
    correctIndex: 0,
    explanation: "La transparencia evita confundir datos demostrativos o manuales con mediciones reales.",
  },
  {
    id: "tp-1",
    packId: "tp-innovacion",
    packTitle: "TP / innovación",
    prompt: "¿Qué proyecto TP se puede construir con datos de calidad del aire?",
    options: ["Panel de monitoreo, alertas o campaña educativa", "Una lista de asistencia manual solamente", "Una decoración sin datos", "Un juego sin relación con el entorno"],
    correctIndex: 0,
    explanation: "Los datos pueden activar paneles, alertas, campañas y soluciones de comunicación o tecnología.",
  },
  {
    id: "tp-2",
    packId: "tp-innovacion",
    packTitle: "TP / innovación",
    prompt: "¿Qué habilidad desarrolla el estudiantado al interpretar sensores?",
    options: ["Lectura de datos y pensamiento crítico", "Memorizar sin entender", "Evitar preguntas", "No usar tecnología"],
    correctIndex: 0,
    explanation: "Interpretar sensores desarrolla lectura de datos, pensamiento crítico y conversación informada.",
  },
  {
    id: "ciencia-1",
    packId: "ciencia-ciudadana",
    packTitle: "Ciencia ciudadana",
    prompt: "¿Qué significa ciencia ciudadana en este contexto?",
    options: ["Que la comunidad educativa observa, interpreta y aprende desde datos del entorno", "Que solo científicos externos pueden mirar los datos", "Que los datos no se comparten nunca", "Que se reemplaza la clase de ciencias"],
    correctIndex: 0,
    explanation: "La ciencia ciudadana invita a la comunidad a observar, preguntar e interpretar datos del propio entorno.",
  },
  {
    id: "ciencia-2",
    packId: "ciencia-ciudadana",
    packTitle: "Ciencia ciudadana",
    prompt: "¿Cuál es una buena pregunta científica para el curso?",
    options: ["¿Cómo cambia el PM2.5 entre mañana y tarde?", "¿Cuál es el color favorito del sensor?", "¿Quién trajo colación?", "¿Cuántas sillas hay?"],
    correctIndex: 0,
    explanation: "Una buena pregunta científica conecta una variable ambiental con tiempo, contexto o comparación.",
  },
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

export type RouteType =
  | "walking"
  | "surface"
  | "elevated"
  | "subterranean"
  | "transition"
  | "transfer"

export type RouteSegment =
  | "sala-sanjoaquin"
  | "l5-ida"
  | "l4-elevado"
  | "plaza-egana"
  | "l4-regreso"
  | "l5-regreso"
  | "vuelta-sala"

export type RoutePoint = {
  id: string
  name: string
  line: string
  direction: string

  lat: number
  lng: number

  type: RouteType
  segment: RouteSegment

  pm25: number
  humidity: number
  temp: number
  db: number
  cfu: number
  crowd: number

  weather?: "clear" | "cloudy" | "rain"

  event?:
    | "pollution"
    | "crowd"
    | "music"
    | "shake"
    | "rain"
}

export function pmColor(pm: number) {
  if (pm <= 12) return "#22c55e"
  if (pm <= 35) return "#eab308"
  if (pm <= 55) return "#f97316"
  if (pm <= 150) return "#ef4444"
  return "#7f1d1d"
}

export function pmLabel(pm: number) {
  if (pm <= 12) return "Buena"
  if (pm <= 35) return "Moderada"
  if (pm <= 55) return "Dañina sensibles"
  if (pm <= 150) return "Dañina"
  return "Muy dañina"
}

export function typeLabel(type: RouteType | string) {
  if (type === "walking") return "Caminata"
  if (type === "surface") return "Superficie"
  if (type === "elevated") return "Elevado"
  if (type === "subterranean") return "Subterráneo"
  if (type === "transition") return "Transición"
  if (type === "transfer") return "Combinación"
  return "Sin clasificar"
}

export const SEGMENT_COLORS: Record<RouteSegment, string> = {
  "sala-sanjoaquin": "#94a3b8",
  "l5-ida": "#22c55e",
  "l4-elevado": "#38bdf8",
  "plaza-egana": "#a855f7",
  "l4-regreso": "#f97316",
  "l5-regreso": "#166534",
  "vuelta-sala": "#64748b",
}

export const SEGMENT_LABELS: Record<RouteSegment, string> = {
  "sala-sanjoaquin": "Sala → San Joaquín",
  "l5-ida": "San Joaquín → Vicente Valdés",
  "l4-elevado": "Vicente Valdés → Trinidad",
  "plaza-egana": "Trinidad → Plaza Egaña",
  "l4-regreso": "Plaza Egaña → Vicente Valdés",
  "l5-regreso": "Vicente Valdés → San Joaquín",
  "vuelta-sala": "San Joaquín → Sala",
}

export const LAB_SUMMARY = {
  rainStart: "durante el regreso hacia Plaza Egaña",
  hypothesis:
    "Los tramos elevados presentan mayores variaciones ambientales debido a exposición vehicular, ventilación abierta y condiciones climáticas.",

  result:
    "Durante el recorrido se observaron diferencias significativas entre zonas elevadas, subterráneas y de transición.",

  rain:
    "Durante el regreso desde Plaza Egaña se registró lluvia, aumentando humedad ambiental y modificando el comportamiento del material particulado.",

  health:
    "La exposición constante a PM2.5 elevados puede generar irritación respiratoria, inflamación pulmonar y riesgos cardiovasculares.",

  conclusion:
    "Las condiciones ambientales del Metro cambian según ventilación, profundidad, densidad de pasajeros y clima exterior.",
}

export const ROUTE_POINTS: RoutePoint[] = [
  {
    id: "sala-inicio",
    name: "Salida de la sala",
    line: "Exterior",
    direction: "Inicio",
    lat: -33.4998,
    lng: -70.6122,
    type: "walking",
    segment: "sala-sanjoaquin",
    pm25: 11,
    humidity: 39,
    temp: 21.1,
    db: 54,
    cfu: 210,
    crowd: 5,
    weather: "clear",
  },

  {
    id: "san-joaquin-ida",
    name: "San Joaquín",
    line: "L5",
    direction: "Ida",
    lat: -33.4994,
    lng: -70.6158,
    type: "surface",
    segment: "l5-ida",
    pm25: 14,
    humidity: 38,
    temp: 21.3,
    db: 68,
    cfu: 280,
    crowd: 20,
    weather: "clear",
  },

  {
    id: "pedrero",
    name: "Pedrero",
    line: "L5",
    direction: "Ida",
    lat: -33.5072,
    lng: -70.6099,
    type: "surface",
    segment: "l5-ida",
    pm25: 18,
    humidity: 37,
    temp: 21.5,
    db: 72,
    cfu: 320,
    crowd: 30,
    weather: "clear",
  },

  {
    id: "mirador",
    name: "Mirador",
    line: "L5",
    direction: "Ida",
    lat: -33.5138,
    lng: -70.6057,
    type: "transition",
    segment: "l5-ida",
    pm25: 24,
    humidity: 36,
    temp: 21.8,
    db: 76,
    cfu: 390,
    crowd: 40,
    weather: "cloudy",
    event: "crowd",
  },

  {
    id: "bellavista",
    name: "Bellavista de La Florida",
    line: "L5",
    direction: "Ida",
    lat: -33.5229,
    lng: -70.5991,
    type: "subterranean",
    segment: "l5-ida",
    pm25: 38,
    humidity: 35,
    temp: 22.1,
    db: 82,
    cfu: 520,
    crowd: 50,
    weather: "cloudy",
  },

  {
    id: "vicente-valdes",
    name: "Vicente Valdés",
    line: "L5/L4",
    direction: "Combinación",
    lat: -33.5264,
    lng: -70.5968,
    type: "transfer",
    segment: "l4-elevado",
    pm25: 52,
    humidity: 34,
    temp: 22.5,
    db: 88,
    cfu: 700,
    crowd: 70,
    weather: "cloudy",
    event: "music",
  },

  {
    id: "rojas-magallanes",
    name: "Rojas Magallanes",
    line: "L4",
    direction: "Ida",
    lat: -33.5328,
    lng: -70.5913,
    type: "elevated",
    segment: "l4-elevado",
    pm25: 58,
    humidity: 33,
    temp: 22.9,
    db: 90,
    cfu: 760,
    crowd: 70,
    weather: "cloudy",
  },

  {
    id: "trinidad",
    name: "Trinidad",
    line: "L4",
    direction: "Ida",
    lat: -33.5384,
    lng: -70.584,
    type: "elevated",
    segment: "l4-elevado",
    pm25: 84,
    humidity: 31,
    temp: 24,
    db: 95,
    cfu: 1000,
    crowd: 80,
    weather: "cloudy",
    event: "pollution",
  },

  {
    id: "vicuña-mackenna",
    name: "Vicuña Mackenna",
    line: "L4/L4A",
    direction: "Regreso",
    lat: -33.5206,
    lng: -70.5908,
    type: "elevated",
    segment: "plaza-egana",
    pm25: 48,
    humidity: 34,
    temp: 22.6,
    db: 82,
    cfu: 680,
    crowd: 60,
    weather: "cloudy",
  },

  {
    id: "macul",
    name: "Macul",
    line: "L4",
    direction: "Regreso",
    lat: -33.5081,
    lng: -70.5905,
    type: "elevated",
    segment: "plaza-egana",
    pm25: 42,
    humidity: 34,
    temp: 22.4,
    db: 80,
    cfu: 640,
    crowd: 55,
    weather: "cloudy",
  },

  {
    id: "las-torres",
    name: "Las Torres",
    line: "L4",
    direction: "Regreso",
    lat: -33.4987,
    lng: -70.5867,
    type: "elevated",
    segment: "plaza-egana",
    pm25: 39,
    humidity: 35,
    temp: 22.2,
    db: 78,
    cfu: 600,
    crowd: 50,
    weather: "cloudy",
  },

  {
    id: "quilin",
    name: "Quilín",
    line: "L4",
    direction: "Regreso",
    lat: -33.4882,
    lng: -70.5798,
    type: "elevated",
    segment: "plaza-egana",
    pm25: 36,
    humidity: 35,
    temp: 22,
    db: 76,
    cfu: 560,
    crowd: 45,
    weather: "cloudy",
  },

  {
    id: "los-presidentes",
    name: "Los Presidentes",
    line: "L4",
    direction: "Regreso",
    lat: -33.4794,
    lng: -70.5763,
    type: "elevated",
    segment: "plaza-egana",
    pm25: 34,
    humidity: 35,
    temp: 21.9,
    db: 75,
    cfu: 540,
    crowd: 40,
    weather: "cloudy",
  },

  {
    id: "grecia",
    name: "Grecia",
    line: "L4",
    direction: "Regreso",
    lat: -33.4701,
    lng: -70.5752,
    type: "subterranean",
    segment: "plaza-egana",
    pm25: 41,
    humidity: 36,
    temp: 22,
    db: 78,
    cfu: 650,
    crowd: 50,
    weather: "cloudy",
  },

  {
    id: "los-orientales",
    name: "Los Orientales",
    line: "L4",
    direction: "Regreso",
    lat: -33.4614,
    lng: -70.575,
    type: "subterranean",
    segment: "plaza-egana",
    pm25: 45,
    humidity: 36,
    temp: 22.1,
    db: 80,
    cfu: 720,
    crowd: 55,
    weather: "cloudy",
  },

  {
    id: "plaza-egana",
    name: "Plaza Egaña",
    line: "L4/L3",
    direction: "Regreso",
    lat: -33.4548,
    lng: -70.5752,
    type: "subterranean",
    segment: "plaza-egana",
    pm25: 50,
    humidity: 37,
    temp: 22.2,
    db: 84,
    cfu: 800,
    crowd: 60,
    weather: "rain",
    event: "shake",
  },

  {
    id: "regreso-vicente",
    name: "Vicente Valdés",
    line: "L4/L5",
    direction: "Regreso",
    lat: -33.5264,
    lng: -70.5968,
    type: "transfer",
    segment: "l4-regreso",
    pm25: 46,
    humidity: 38,
    temp: 21.9,
    db: 82,
    cfu: 700,
    crowd: 55,
    weather: "rain",
    event: "rain",
  },

  {
    id: "bellavista-regreso",
    name: "Bellavista de La Florida",
    line: "L5",
    direction: "Regreso",
    lat: -33.5229,
    lng: -70.5991,
    type: "subterranean",
    segment: "l5-regreso",
    pm25: 38,
    humidity: 37,
    temp: 21.8,
    db: 78,
    cfu: 580,
    crowd: 45,
    weather: "rain",
  },

  {
    id: "mirador-regreso",
    name: "Mirador",
    line: "L5",
    direction: "Regreso",
    lat: -33.5138,
    lng: -70.6057,
    type: "surface",
    segment: "l5-regreso",
    pm25: 26,
    humidity: 36,
    temp: 21.6,
    db: 71,
    cfu: 420,
    crowd: 30,
    weather: "rain",
  },

  {
    id: "pedrero-regreso",
    name: "Pedrero",
    line: "L5",
    direction: "Regreso",
    lat: -33.5072,
    lng: -70.6099,
    type: "surface",
    segment: "l5-regreso",
    pm25: 20,
    humidity: 37,
    temp: 21.5,
    db: 69,
    cfu: 350,
    crowd: 25,
    weather: "rain",
  },

  {
    id: "san-joaquin-regreso",
    name: "San Joaquín",
    line: "L5",
    direction: "Regreso",
    lat: -33.4994,
    lng: -70.6158,
    type: "surface",
    segment: "l5-regreso",
    pm25: 14,
    humidity: 38,
    temp: 21.3,
    db: 66,
    cfu: 300,
    crowd: 20,
    weather: "rain",
  },

  {
    id: "sala-final",
    name: "Regreso sala",
    line: "Exterior",
    direction: "Final",
    lat: -33.4998,
    lng: -70.6122,
    type: "walking",
    segment: "vuelta-sala",
    pm25: 12,
    humidity: 39,
    temp: 21.2,
    db: 55,
    cfu: 220,
    crowd: 5,
    weather: "rain",
  },
]

export type RouteType =
  | "walking"
  | "surface"
  | "elevated"
  | "subterranean"
  | "transition"
  | "transfer"

export type RoutePoint = {
  id: string
  name: string
  line: string
  direction: string
  lat: number
  lng: number
  type: RouteType
  pm25: number
  humidity: number
  temp: number
  db: number
  cfu: number
  crowd: number
  event?: "pollution" | "crowd" | "music" | "shake"
}

export function pmColor(pm: number) {
  if (pm <= 12) return "#22c55e"
  if (pm <= 35) return "#eab308"
  if (pm <= 55) return "#f97316"
  if (pm <= 150) return "#ef4444"
  return "#7f1d1d"
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

export const ROUTE_POINTS: RoutePoint[] = [
  { id: "san-joaquin-ida", name: "San Joaquín", line: "L5", direction: "Ida", lat: -33.4994, lng: -70.6158, type: "surface", pm25: 14, humidity: 38, temp: 21.3, db: 68, cfu: 280, crowd: 20 },
  { id: "pedrero-ida", name: "Pedrero", line: "L5", direction: "Ida", lat: -33.5072, lng: -70.6099, type: "surface", pm25: 18, humidity: 37, temp: 21.5, db: 72, cfu: 320, crowd: 30 },
  { id: "mirador-ida", name: "Mirador", line: "L5", direction: "Ida", lat: -33.5138, lng: -70.6057, type: "transition", pm25: 24, humidity: 36, temp: 21.8, db: 76, cfu: 390, crowd: 40, event: "crowd" },
  { id: "entierro-l5-ida", name: "Empieza a enterrarse", line: "L5", direction: "Ida", lat: -33.5190, lng: -70.6018, type: "transition", pm25: 31, humidity: 36, temp: 22.0, db: 79, cfu: 440, crowd: 45 },
  { id: "bellavista-ida", name: "Bellavista de La Florida", line: "L5", direction: "Ida", lat: -33.5229, lng: -70.5991, type: "subterranean", pm25: 38, humidity: 35, temp: 22.1, db: 82, cfu: 520, crowd: 50 },
  { id: "vicente-valdes-ida", name: "Vicente Valdés", line: "L5", direction: "Ida", lat: -33.5264, lng: -70.5968, type: "subterranean", pm25: 45, humidity: 35, temp: 22.3, db: 86, cfu: 620, crowd: 60 },

  { id: "combinacion-puente-alto", name: "Cambio dirección Plaza de Puente Alto", line: "L5/L4", direction: "Combinación", lat: -33.5264, lng: -70.5968, type: "transfer", pm25: 52, humidity: 34, temp: 22.5, db: 88, cfu: 700, crowd: 70, event: "music" },
  { id: "rojas-magallanes-ida", name: "Rojas Magallanes", line: "L4", direction: "Ida", lat: -33.5328, lng: -70.5913, type: "elevated", pm25: 58, humidity: 33, temp: 22.9, db: 90, cfu: 760, crowd: 70 },
  { id: "trinidad-ida", name: "Trinidad", line: "L4", direction: "Ida", lat: -33.5384, lng: -70.5840, type: "elevated", pm25: 84, humidity: 31, temp: 24.0, db: 95, cfu: 1000, crowd: 80, event: "pollution" },

  { id: "combinacion-tobalaba", name: "Cambio dirección Tobalaba", line: "L4", direction: "Regreso", lat: -33.5384, lng: -70.5840, type: "transfer", pm25: 80, humidity: 31, temp: 23.8, db: 93, cfu: 950, crowd: 75 },
  { id: "rojas-magallanes-vuelta-1", name: "Rojas Magallanes", line: "L4", direction: "Regreso", lat: -33.5328, lng: -70.5913, type: "elevated", pm25: 72, humidity: 32, temp: 23.5, db: 91, cfu: 860, crowd: 70 },
  { id: "vicente-valdes-vuelta-1", name: "Vicente Valdés", line: "L4", direction: "Regreso", lat: -33.5264, lng: -70.5968, type: "transition", pm25: 55, humidity: 34, temp: 22.8, db: 86, cfu: 720, crowd: 65 },
  { id: "vicuna-mackenna-vuelta-1", name: "Vicuña Mackenna", line: "L4/L4A", direction: "Regreso", lat: -33.5206, lng: -70.5908, type: "elevated", pm25: 48, humidity: 34, temp: 22.6, db: 82, cfu: 680, crowd: 60 },
  { id: "macul-vuelta-1", name: "Macul", line: "L4", direction: "Regreso", lat: -33.5081, lng: -70.5905, type: "elevated", pm25: 42, humidity: 34, temp: 22.4, db: 80, cfu: 640, crowd: 55 },
  { id: "las-torres-vuelta-1", name: "Las Torres", line: "L4", direction: "Regreso", lat: -33.4987, lng: -70.5867, type: "elevated", pm25: 39, humidity: 35, temp: 22.2, db: 78, cfu: 600, crowd: 50 },
  { id: "quilin-vuelta-1", name: "Quilín", line: "L4", direction: "Regreso", lat: -33.4882, lng: -70.5798, type: "elevated", pm25: 36, humidity: 35, temp: 22.0, db: 76, cfu: 560, crowd: 45 },
  { id: "los-presidentes-vuelta-1", name: "Los Presidentes", line: "L4", direction: "Regreso", lat: -33.4794, lng: -70.5763, type: "elevated", pm25: 34, humidity: 35, temp: 21.9, db: 75, cfu: 540, crowd: 40 },
  { id: "entierro-l4-vuelta-1", name: "Empieza a enterrarse", line: "L4", direction: "Regreso", lat: -33.4745, lng: -70.5756, type: "transition", pm25: 37, humidity: 36, temp: 21.9, db: 76, cfu: 580, crowd: 45 },
  { id: "grecia-vuelta-1", name: "Grecia", line: "L4", direction: "Regreso", lat: -33.4701, lng: -70.5752, type: "subterranean", pm25: 41, humidity: 36, temp: 22.0, db: 78, cfu: 650, crowd: 50 },
  { id: "los-orientales-vuelta-1", name: "Los Orientales", line: "L4", direction: "Regreso", lat: -33.4614, lng: -70.5750, type: "subterranean", pm25: 45, humidity: 36, temp: 22.1, db: 80, cfu: 720, crowd: 55 },
  { id: "plaza-egana-vuelta-1", name: "Plaza Egaña", line: "L4/L3", direction: "Regreso", lat: -33.4548, lng: -70.5752, type: "subterranean", pm25: 50, humidity: 37, temp: 22.2, db: 84, cfu: 800, crowd: 60, event: "shake" },

  { id: "combinacion-plaza-puente-alto", name: "Combinación dirección Plaza de Puente Alto", line: "L4/L3", direction: "Combinación", lat: -33.4548, lng: -70.5752, type: "transfer", pm25: 54, humidity: 37, temp: 22.3, db: 86, cfu: 850, crowd: 70 },
  { id: "plaza-egana-ida-2", name: "Plaza Egaña", line: "L4/L3", direction: "Ida", lat: -33.4548, lng: -70.5752, type: "subterranean", pm25: 52, humidity: 37, temp: 22.2, db: 84, cfu: 820, crowd: 65 },
  { id: "los-orientales-ida-2", name: "Los Orientales", line: "L4", direction: "Ida", lat: -33.4614, lng: -70.5750, type: "subterranean", pm25: 47, humidity: 36, temp: 22.1, db: 80, cfu: 740, crowd: 55 },
  { id: "grecia-ida-2", name: "Grecia", line: "L4", direction: "Ida", lat: -33.4701, lng: -70.5752, type: "subterranean", pm25: 43, humidity: 36, temp: 22.0, db: 78, cfu: 670, crowd: 50 },
  { id: "salida-superficie-l4-ida-2", name: "Empieza a salir a superficie", line: "L4", direction: "Ida", lat: -33.4745, lng: -70.5756, type: "transition", pm25: 38, humidity: 35, temp: 22.0, db: 76, cfu: 620, crowd: 45 },
  { id: "los-presidentes-ida-2", name: "Los Presidentes", line: "L4", direction: "Ida", lat: -33.4794, lng: -70.5763, type: "elevated", pm25: 35, humidity: 35, temp: 21.9, db: 74, cfu: 560, crowd: 40 },
  { id: "quilin-ida-2", name: "Quilín", line: "L4", direction: "Ida", lat: -33.4882, lng: -70.5798, type: "elevated", pm25: 33, humidity: 34, temp: 21.9, db: 73, cfu: 520, crowd: 35 },
  { id: "las-torres-ida-2", name: "Las Torres", line: "L4", direction: "Ida", lat: -33.4987, lng: -70.5867, type: "elevated", pm25: 32, humidity: 34, temp: 21.8, db: 72, cfu: 500, crowd: 35 },
  { id: "macul-ida-2", name: "Macul", line: "L4", direction: "Ida", lat: -33.5081, lng: -70.5905, type: "elevated", pm25: 34, humidity: 34, temp: 21.9, db: 73, cfu: 530, crowd: 40 },
  { id: "entierro-l4-ida-2", name: "Empieza a enterrarse", line: "L4", direction: "Ida", lat: -33.5162, lng: -70.5928, type: "transition", pm25: 39, humidity: 35, temp: 22.0, db: 77, cfu: 590, crowd: 50 },
  { id: "vicuna-mackenna-ida-2", name: "Vicuña Mackenna", line: "L4/L4A", direction: "Ida", lat: -33.5206, lng: -70.5908, type: "transition", pm25: 42, humidity: 35, temp: 22.1, db: 79, cfu: 640, crowd: 55 },
  { id: "vicente-valdes-ida-2", name: "Vicente Valdés", line: "L4", direction: "Ida", lat: -33.5264, lng: -70.5968, type: "subterranean", pm25: 48, humidity: 36, temp: 22.2, db: 82, cfu: 700, crowd: 60 },

  { id: "combinacion-linea-5", name: "Combinación a Línea 5", line: "L4/L5", direction: "Combinación", lat: -33.5264, lng: -70.5968, type: "transfer", pm25: 50, humidity: 36, temp: 22.2, db: 84, cfu: 730, crowd: 65 },
  { id: "vicente-valdes-l5-regreso", name: "Vicente Valdés", line: "L5", direction: "Regreso", lat: -33.5264, lng: -70.5968, type: "subterranean", pm25: 46, humidity: 36, temp: 22.1, db: 81, cfu: 690, crowd: 55 },
  { id: "bellavista-regreso", name: "Bellavista de La Florida", line: "L5", direction: "Regreso", lat: -33.5229, lng: -70.5991, type: "subterranean", pm25: 38, humidity: 35, temp: 21.9, db: 78, cfu: 580, crowd: 45 },
  { id: "subida-superficie-l5-regreso", name: "Empieza a subir de superficie", line: "L5", direction: "Regreso", lat: -33.5190, lng: -70.6018, type: "transition", pm25: 32, humidity: 35, temp: 21.8, db: 74, cfu: 500, crowd: 35 },
  { id: "mirador-regreso", name: "Mirador", line: "L5", direction: "Regreso", lat: -33.5138, lng: -70.6057, type: "surface", pm25: 26, humidity: 36, temp: 21.6, db: 71, cfu: 420, crowd: 30 },
  { id: "pedrero-regreso", name: "Pedrero", line: "L5", direction: "Regreso", lat: -33.5072, lng: -70.6099, type: "surface", pm25: 20, humidity: 37, temp: 21.5, db: 69, cfu: 350, crowd: 25 },
  { id: "san-joaquin-regreso", name: "San Joaquín", line: "L5", direction: "Regreso", lat: -33.4994, lng: -70.6158, type: "surface", pm25: 14, humidity: 38, temp: 21.3, db: 66, cfu: 300, crowd: 20 },
  { id: "camino-sala-regreso", name: "Camino a la sala", line: "Exterior", direction: "Regreso", lat: -33.4998, lng: -70.6122, type: "walking", pm25: 12, humidity: 39, temp: 21.2, db: 55, cfu: 220, crowd: 5 },
]

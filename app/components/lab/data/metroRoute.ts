export type RoutePoint = {
  id: string
  name: string
  line: string
  lat: number
  lng: number
  type: "walking" | "subterranean" | "elevated" | "transition"
  direction: "Ida" | "Regreso"
  pm25: number
  temp: number
  humidity: number
  db: number
  crowd: number
  cfu: number
  event?: "pollution" | "crowd" | "music" | "shake"
}

export const ROUTE_POINTS: RoutePoint[] = [
  { id:"sala-ida", name:"Sala Universidad", line:"Exterior", lat:-33.49625, lng:-70.60975, type:"walking", direction:"Ida", pm25:10, temp:21.0, humidity:34, db:50, crowd:1, cfu:0 },
  { id:"san-joaquin-ida", name:"San Joaquín", line:"L5", lat:-33.4994, lng:-70.6158, type:"subterranean", direction:"Ida", pm25:14, temp:21.3, humidity:33.5, db:68, crowd:4, cfu:20 },
  { id:"pedrero-ida", name:"Pedrero", line:"L5", lat:-33.5079, lng:-70.6099, type:"subterranean", direction:"Ida", pm25:26, temp:21.5, humidity:34.1, db:72, crowd:5, cfu:35, event:"crowd" },
  { id:"mirador-ida", name:"Mirador", line:"L5", lat:-33.5138, lng:-70.6057, type:"subterranean", direction:"Ida", pm25:38, temp:21.7, humidity:34.7, db:74, crowd:6, cfu:50 },
  { id:"bellavista-ida", name:"Bellavista de La Florida", line:"L5", lat:-33.5206, lng:-70.6011, type:"subterranean", direction:"Ida", pm25:58, temp:22.2, humidity:38, db:82, crowd:8, cfu:70 },
  { id:"vicente-valdes-ida", name:"Vicente Valdés / Combinación", line:"L5/L4", lat:-33.5264, lng:-70.5968, type:"transition", direction:"Ida", pm25:84, temp:22.4, humidity:41.5, db:91, crowd:10, cfu:120, event:"pollution" },
  { id:"rojas-magallanes-ida", name:"Rojas Magallanes", line:"L4", lat:-33.5309, lng:-70.5929, type:"elevated", direction:"Ida", pm25:37, temp:21.8, humidity:32, db:76, crowd:5, cfu:65, event:"music" },
  { id:"trinidad-ida", name:"Trinidad", line:"L4", lat:-33.5353, lng:-70.5887, type:"elevated", direction:"Ida", pm25:21, temp:21.6, humidity:31.2, db:70, crowd:4, cfu:45 },
  { id:"plaza-egana-ida", name:"Plaza Egaña", line:"L4/L3", lat:-33.4548, lng:-70.5752, type:"subterranean", direction:"Ida", pm25:31, temp:21.9, humidity:35, db:73, crowd:6, cfu:80 },
  { id:"trinidad-vuelta", name:"Trinidad", line:"L4", lat:-33.5353, lng:-70.5887, type:"elevated", direction:"Regreso", pm25:25, temp:21.7, humidity:32.1, db:71, crowd:4, cfu:42 },
  { id:"rojas-magallanes-vuelta", name:"Rojas Magallanes", line:"L4", lat:-33.5309, lng:-70.5929, type:"elevated", direction:"Regreso", pm25:29, temp:21.8, humidity:33, db:73, crowd:5, cfu:55 },
  { id:"vicuna-mackenna-vuelta", name:"Vicuña Mackenna", line:"L4/L4A", lat:-33.5398, lng:-70.5864, type:"transition", direction:"Regreso", pm25:34, temp:21.9, humidity:34, db:76, crowd:6, cfu:60 },
  { id:"macul-vuelta", name:"Macul", line:"L4", lat:-33.5081, lng:-70.5905, type:"elevated", direction:"Regreso", pm25:31, temp:21.8, humidity:34.2, db:74, crowd:5, cfu:58 },
  { id:"las-torres-vuelta", name:"Las Torres", line:"L4", lat:-33.4987, lng:-70.5867, type:"elevated", direction:"Regreso", pm25:28, temp:21.7, humidity:33.8, db:72, crowd:4, cfu:40 },
  { id:"quilin-vuelta", name:"Quilín", line:"L4", lat:-33.4882, lng:-70.5798, type:"elevated", direction:"Regreso", pm25:30, temp:21.7, humidity:34.1, db:73, crowd:4, cfu:44 },
  { id:"los-presidentes-vuelta", name:"Los Presidentes", line:"L4", lat:-33.4794, lng:-70.5763, type:"elevated", direction:"Regreso", pm25:32, temp:21.8, humidity:34.5, db:74, crowd:5, cfu:47 },
  { id:"grecia-vuelta", name:"Grecia", line:"L4", lat:-33.4701, lng:-70.5752, type:"subterranean", direction:"Regreso", pm25:36, temp:21.9, humidity:35.1, db:76, crowd:6, cfu:69 },
  { id:"los-orientales-vuelta", name:"Los Orientales", line:"L4", lat:-33.4614, lng:-70.5750, type:"subterranean", direction:"Regreso", pm25:39, temp:22.0, humidity:35.5, db:77, crowd:6, cfu:74 },
  { id:"plaza-egana-vuelta", name:"Plaza Egaña", line:"L4/L3", lat:-33.4548, lng:-70.5752, type:"subterranean", direction:"Regreso", pm25:42, temp:22.1, humidity:36, db:89, crowd:7, cfu:90, event:"shake" },
  { id:"vicente-valdes-regreso", name:"Vicente Valdés / Combinación", line:"L4/L5", lat:-33.5264, lng:-70.5968, type:"transition", direction:"Regreso", pm25:48, temp:22.1, humidity:37, db:80, crowd:7, cfu:76 },
  { id:"bellavista-regreso", name:"Bellavista de La Florida", line:"L5", lat:-33.5206, lng:-70.6011, type:"subterranean", direction:"Regreso", pm25:41, temp:21.9, humidity:35.5, db:75, crowd:5, cfu:62 },
  { id:"mirador-regreso", name:"Mirador", line:"L5", lat:-33.5138, lng:-70.6057, type:"subterranean", direction:"Regreso", pm25:36, temp:21.8, humidity:35.1, db:72, crowd:4, cfu:51 },
  { id:"pedrero-regreso", name:"Pedrero", line:"L5", lat:-33.5079, lng:-70.6099, type:"subterranean", direction:"Regreso", pm25:30, temp:21.6, humidity:34, db:69, crowd:3, cfu:40 },
  { id:"san-joaquin-regreso", name:"San Joaquín", line:"L5", lat:-33.4994, lng:-70.6158, type:"subterranean", direction:"Regreso", pm25:26, temp:21.5, humidity:34, db:66, crowd:3, cfu:35 },
  { id:"sala-regreso", name:"Sala Universidad", line:"Exterior", lat:-33.49625, lng:-70.60975, type:"walking", direction:"Regreso", pm25:12, temp:21.2, humidity:33, db:48, crowd:1, cfu:0 },
]

export function pmColor(pm25: number) {
  if (pm25 >= 70) return "#ef4444"
  if (pm25 >= 45) return "#f97316"
  if (pm25 >= 25) return "#facc15"
  return "#22d3ee"
}

export function typeLabel(type: RoutePoint["type"]) {
  if (type === "walking") return "Caminata"
  if (type === "subterranean") return "Subterráneo"
  if (type === "elevated") return "Elevado"
  return "Transición"
}

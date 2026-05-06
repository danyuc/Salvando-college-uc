export type RouteType = "walking" | "surface" | "elevated" | "subterranean" | "transition" | "transfer"

export type RouteSegment =
  | "sala-sanjoaquin"
  | "l5-ida"
  | "l4-trinidad"
  | "l4-plaza-egana"
  | "l4-regreso-vicente"
  | "l5-regreso"
  | "vuelta-sala"

export type RoutePoint = {
  id: string
  name: string
  displayName: string
  line: string
  direction: string
  lat: number
  lng: number
  type: RouteType
  segment: RouteSegment
  pm25: number
  pmPeak: number
  humidity: number
  temp: number
  db: number
  cfu: number
  crowd: number
  weather?: "clear" | "cloudy" | "rain"
  event?: "pollution" | "crowd" | "music" | "shake" | "rain" | "heat"
  observation?: string
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
  if (pm <= 55) return "Dañina para sensibles"
  if (pm <= 150) return "Dañina"
  return "Muy dañina"
}

export function typeLabel(type: RouteType | string) {
  if (type === "walking") return "Caminata"
  if (type === "surface") return "Exterior / superficie"
  if (type === "elevated") return "Exterior / elevado"
  if (type === "subterranean") return "Subterráneo"
  if (type === "transition") return "Transición"
  if (type === "transfer") return "Combinación"
  return "Sin clasificar"
}

export function peopleIcons(crowd: number) {
  return "👤".repeat(Math.max(1, Math.min(10, Math.ceil(crowd / 10))))
}

export const SEGMENT_COLORS: Record<RouteSegment, string> = {
  "sala-sanjoaquin": "#94a3b8",
  "l5-ida": "#22c55e",
  "l4-trinidad": "#38bdf8",
  "l4-plaza-egana": "#a855f7",
  "l4-regreso-vicente": "#f97316",
  "l5-regreso": "#16a34a",
  "vuelta-sala": "#64748b",
}

export const SEGMENT_LABELS: Record<RouteSegment, string> = {
  "sala-sanjoaquin": "Sala → San Joaquín",
  "l5-ida": "San Joaquín → Vicente Valdés",
  "l4-trinidad": "Vicente Valdés → Trinidad",
  "l4-plaza-egana": "Trinidad → Plaza Egaña",
  "l4-regreso-vicente": "Plaza Egaña → Vicente Valdés",
  "l5-regreso": "Vicente Valdés → San Joaquín",
  "vuelta-sala": "San Joaquín → Sala",
}

export const LAB_SUMMARY = {
  rainStart: "durante el regreso desde Plaza Egaña",
  hypothesis:
    "La hipótesis inicial esperaba mayores concentraciones de PM2.5 en tramos elevados por exposición a vías vehiculares.",
  result:
    "Los datos sugieren que las combinaciones, zonas subterráneas, densidad de pasajeros, ventilación y lluvia influyeron más que la altura del tramo por sí sola.",
  rain:
    "Durante el regreso se registró lluvia, lo que coincidió con una disminución relativa de PM2.5 en varios tramos exteriores.",
  health:
    "La exposición frecuente a PM2.5 puede afectar vías respiratorias, generar irritación, inflamación y riesgos cardiovasculares acumulativos.",
  conclusion:
    "La hipótesis se rechaza parcialmente: no todos los tramos elevados presentaron mayores concentraciones; las condiciones operacionales y ambientales fueron determinantes.",
}

export const ROUTE_POINTS: RoutePoint[] = [
  { id:"sala-inicio", name:"Salida sala", displayName:"Sala", line:"Exterior", direction:"Inicio", lat:-33.49664, lng:-70.61014, type:"walking", segment:"sala-sanjoaquin", pm25:11, pmPeak:15, humidity:53, temp:20.6, db:55, cfu:0, crowd:5, weather:"clear", observation:"Inicio del recorrido desde la sala. UFC pendiente: no se usa dato inventado." },

  { id:"san-joaquin-ida", name:"San Joaquín", displayName:"San Joaquín", line:"L5", direction:"Ida", lat:-33.4994, lng:-70.6158, type:"surface", segment:"l5-ida", pm25:14, pmPeak:18, humidity:38, temp:21.3, db:68, cfu:0, crowd:45, weather:"clear", observation:"Tramo con ocupación media, no lleno ni vacío." },
  { id:"pedrero-ida", name:"Pedrero", displayName:"Pedrero", line:"L5", direction:"Ida", lat:-33.5072, lng:-70.6099, type:"surface", segment:"l5-ida", pm25:18, pmPeak:22, humidity:37, temp:21.5, db:72, cfu:0, crowd:50, weather:"clear" },
  { id:"mirador-ida", name:"Mirador", displayName:"Mirador", line:"L5", direction:"Ida", lat:-33.5138, lng:-70.6057, type:"surface", segment:"l5-ida", pm25:24, pmPeak:31, humidity:36, temp:21.8, db:76, cfu:0, crowd:55, weather:"cloudy", observation:"Último tramo exterior antes de entrar a sector subterráneo." },
  { id:"transicion-mirador-bellavista", name:"Transición a subterráneo", displayName:"Trans. subterráneo", line:"L5", direction:"Mirador → Bellavista", lat:-33.5182, lng:-70.6022, type:"transition", segment:"l5-ida", pm25:31, pmPeak:38, humidity:35, temp:22.0, db:79, cfu:0, crowd:55, weather:"cloudy" },
  { id:"bellavista-ida", name:"Bellavista de La Florida", displayName:"Bellavista", line:"L5", direction:"Ida", lat:-33.5229, lng:-70.5991, type:"subterranean", segment:"l5-ida", pm25:38, pmPeak:45, humidity:35, temp:22.1, db:82, cfu:0, crowd:55, weather:"cloudy" },
  { id:"vicente-valdes-ida", name:"Vicente Valdés", displayName:"Vicente", line:"L5/L4", direction:"Combinación", lat:-33.5264, lng:-70.5968, type:"transfer", segment:"l5-ida", pm25:52, pmPeak:58, humidity:34, temp:22.5, db:88, cfu:0, crowd:60, weather:"cloudy", event:"crowd", observation:"Combinación hacia Línea 4." },

  { id:"transicion-vicente-rojas", name:"Transición a exterior", displayName:"Trans. exterior", line:"L4", direction:"Vicente → Rojas", lat:-33.5295, lng:-70.5941, type:"transition", segment:"l4-trinidad", pm25:55, pmPeak:64, humidity:33, temp:22.7, db:88, cfu:0, crowd:80, weather:"cloudy" },
  { id:"rojas-ida", name:"Rojas Magallanes", displayName:"Rojas", line:"L4", direction:"Plaza Puente Alto", lat:-33.5328, lng:-70.5913, type:"elevated", segment:"l4-trinidad", pm25:58, pmPeak:72, humidity:33, temp:22.9, db:90, cfu:0, crowd:85, weather:"cloudy", event:"shake", observation:"Tramo lleno entre Vicente y Trinidad." },
  { id:"trinidad-ida", name:"Trinidad", displayName:"Trinidad", line:"L4", direction:"Plaza Puente Alto", lat:-33.5384, lng:-70.5840, type:"elevated", segment:"l4-trinidad", pm25:84, pmPeak:84, humidity:31, temp:24, db:95, cfu:0, crowd:85, weather:"cloudy", event:"pollution", observation:"Peak de PM2.5 y ruido; tramo con alta ocupación." },

  { id:"trinidad-vuelta", name:"Trinidad", displayName:"Trinidad v.", line:"L4", direction:"Tobalaba", lat:-33.5384, lng:-70.5840, type:"elevated", segment:"l4-plaza-egana", pm25:60, pmPeak:70, humidity:32, temp:23.6, db:86, cfu:0, crowd:35, weather:"cloudy", observation:"Desde Trinidad hacia Plaza Egaña había menos personas." },
  { id:"rojas-vuelta", name:"Rojas Magallanes", displayName:"Rojas v.", line:"L4", direction:"Tobalaba", lat:-33.5328, lng:-70.5913, type:"elevated", segment:"l4-plaza-egana", pm25:55, pmPeak:64, humidity:33, temp:23.2, db:84, cfu:0, crowd:35, weather:"cloudy" },
  { id:"transicion-rojas-vicente", name:"Transición a subterráneo", displayName:"Trans. subterráneo", line:"L4", direction:"Rojas → Vicente", lat:-33.5295, lng:-70.5941, type:"transition", segment:"l4-plaza-egana", pm25:50, pmPeak:58, humidity:34, temp:22.9, db:82, cfu:0, crowd:40, weather:"cloudy" },
  { id:"vicente-vuelta-l4", name:"Vicente Valdés", displayName:"Vicente L4", line:"L4", direction:"Tobalaba", lat:-33.5264, lng:-70.5968, type:"subterranean", segment:"l4-plaza-egana", pm25:48, pmPeak:55, humidity:34, temp:22.8, db:80, cfu:0, crowd:40, weather:"cloudy" },
  { id:"vicuna", name:"Vicuña Mackenna", displayName:"Vicuña", line:"L4", direction:"Tobalaba", lat:-33.5206, lng:-70.5908, type:"subterranean", segment:"l4-plaza-egana", pm25:43, pmPeak:50, humidity:35, temp:22.4, db:78, cfu:0, crowd:40, weather:"cloudy" },
  { id:"transicion-vicuna-macul", name:"Transición a superficie", displayName:"Trans. superficie", line:"L4", direction:"Vicuña → Macul", lat:-33.5145, lng:-70.5910, type:"transition", segment:"l4-plaza-egana", pm25:39, pmPeak:45, humidity:35, temp:22.3, db:76, cfu:0, crowd:38, weather:"cloudy" },
  { id:"macul", name:"Macul", displayName:"Macul", line:"L4", direction:"Tobalaba", lat:-33.5081, lng:-70.5905, type:"elevated", segment:"l4-plaza-egana", pm25:34, pmPeak:40, humidity:35, temp:22.2, db:75, cfu:0, crowd:35, weather:"cloudy" },
  { id:"las-torres", name:"Las Torres", displayName:"Las Torres", line:"L4", direction:"Tobalaba", lat:-33.4987, lng:-70.5867, type:"elevated", segment:"l4-plaza-egana", pm25:33, pmPeak:39, humidity:35, temp:22.1, db:74, cfu:0, crowd:35, weather:"cloudy" },
  { id:"quilin", name:"Quilín", displayName:"Quilín", line:"L4", direction:"Tobalaba", lat:-33.4882, lng:-70.5798, type:"elevated", segment:"l4-plaza-egana", pm25:32, pmPeak:38, humidity:35, temp:22.0, db:73, cfu:0, crowd:35, weather:"cloudy", event:"music" },
  { id:"los-presidentes", name:"Los Presidentes", displayName:"Presidentes", line:"L4", direction:"Tobalaba", lat:-33.4794, lng:-70.5763, type:"elevated", segment:"l4-plaza-egana", pm25:34, pmPeak:40, humidity:35, temp:21.9, db:75, cfu:0, crowd:35, weather:"cloudy" },
  { id:"transicion-presidentes-grecia", name:"Transición a subterráneo", displayName:"Trans. subterráneo", line:"L4", direction:"Presidentes → Grecia", lat:-33.4745, lng:-70.5756, type:"transition", segment:"l4-plaza-egana", pm25:38, pmPeak:44, humidity:36, temp:21.9, db:76, cfu:0, crowd:40, weather:"cloudy" },
  { id:"grecia", name:"Grecia", displayName:"Grecia", line:"L4", direction:"Tobalaba", lat:-33.4701, lng:-70.5752, type:"subterranean", segment:"l4-plaza-egana", pm25:41, pmPeak:47, humidity:36, temp:22, db:78, cfu:0, crowd:40, weather:"cloudy" },
  { id:"los-orientales", name:"Los Orientales", displayName:"Orientales", line:"L4", direction:"Tobalaba", lat:-33.4614, lng:-70.5750, type:"subterranean", segment:"l4-plaza-egana", pm25:45, pmPeak:52, humidity:36, temp:22.1, db:80, cfu:0, crowd:45, weather:"cloudy" },
  { id:"plaza-egana", name:"Plaza Egaña", displayName:"Plaza Egaña", line:"L4/L3", direction:"Combinación", lat:-33.4530, lng:-70.5708, type:"transfer", segment:"l4-plaza-egana", pm25:50, pmPeak:58, humidity:37, temp:22.2, db:84, cfu:0, crowd:50, weather:"rain", event:"rain" },

  { id:"plaza-egana-regreso", name:"Plaza Egaña", displayName:"Plaza vuelta", line:"L4", direction:"Plaza Puente Alto", lat:-33.4530, lng:-70.5708, type:"transfer", segment:"l4-regreso-vicente", pm25:52, pmPeak:60, humidity:38, temp:22.3, db:86, cfu:0, crowd:90, weather:"rain", event:"crowd", observation:"Desde Plaza Egaña hacia Vicente el vagón estaba lleno." },
  { id:"grecia-regreso", name:"Grecia", displayName:"Grecia v.", line:"L4", direction:"Plaza Puente Alto", lat:-33.4701, lng:-70.5752, type:"subterranean", segment:"l4-regreso-vicente", pm25:43, pmPeak:50, humidity:39, temp:22.0, db:78, cfu:0, crowd:85, weather:"rain" },
  { id:"transicion-grecia-presidentes", name:"Transición a superficie", displayName:"Trans. superficie", line:"L4", direction:"Grecia → Presidentes", lat:-33.4745, lng:-70.5756, type:"transition", segment:"l4-regreso-vicente", pm25:38, pmPeak:44, humidity:40, temp:21.9, db:76, cfu:0, crowd:80, weather:"rain" },
  { id:"los-presidentes-regreso", name:"Los Presidentes", displayName:"Presidentes v.", line:"L4", direction:"Plaza Puente Alto", lat:-33.4794, lng:-70.5763, type:"elevated", segment:"l4-regreso-vicente", pm25:35, pmPeak:42, humidity:40, temp:21.9, db:74, cfu:0, crowd:80, weather:"rain" },
  { id:"quilin-regreso", name:"Quilín", displayName:"Quilín v.", line:"L4", direction:"Plaza Puente Alto", lat:-33.4882, lng:-70.5798, type:"elevated", segment:"l4-regreso-vicente", pm25:33, pmPeak:38, humidity:41, temp:21.9, db:73, cfu:0, crowd:78, weather:"rain" },
  { id:"las-torres-regreso", name:"Las Torres", displayName:"Torres v.", line:"L4", direction:"Plaza Puente Alto", lat:-33.4987, lng:-70.5867, type:"elevated", segment:"l4-regreso-vicente", pm25:32, pmPeak:37, humidity:41, temp:21.8, db:72, cfu:0, crowd:75, weather:"rain" },
  { id:"macul-regreso", name:"Macul", displayName:"Macul v.", line:"L4", direction:"Plaza Puente Alto", lat:-33.5081, lng:-70.5905, type:"elevated", segment:"l4-regreso-vicente", pm25:34, pmPeak:40, humidity:40, temp:21.9, db:73, cfu:0, crowd:70, weather:"rain" },
  { id:"transicion-macul-vicuna", name:"Transición a subterráneo", displayName:"Trans. subterráneo", line:"L4", direction:"Macul → Vicuña", lat:-33.5145, lng:-70.5910, type:"transition", segment:"l4-regreso-vicente", pm25:39, pmPeak:45, humidity:39, temp:22.0, db:76, cfu:0, crowd:70, weather:"rain" },
  { id:"vicuna-regreso", name:"Vicuña Mackenna", displayName:"Vicuña v.", line:"L4", direction:"Plaza Puente Alto", lat:-33.5206, lng:-70.5908, type:"subterranean", segment:"l4-regreso-vicente", pm25:42, pmPeak:48, humidity:39, temp:22.1, db:79, cfu:0, crowd:65, weather:"rain" },
  { id:"vicente-regreso", name:"Vicente Valdés", displayName:"Vicente v.", line:"L4/L5", direction:"Combinación", lat:-33.5264, lng:-70.5968, type:"transfer", segment:"l4-regreso-vicente", pm25:46, pmPeak:52, humidity:38, temp:21.9, db:82, cfu:0, crowd:60, weather:"rain" },

  { id:"bellavista-regreso", name:"Bellavista de La Florida", displayName:"Bellavista v.", line:"L5", direction:"Regreso", lat:-33.5229, lng:-70.5991, type:"subterranean", segment:"l5-regreso", pm25:38, pmPeak:44, humidity:37, temp:21.8, db:78, cfu:0, crowd:45, weather:"rain" },
  { id:"transicion-bellavista-mirador", name:"Transición a superficie", displayName:"Trans. superficie", line:"L5", direction:"Bellavista → Mirador", lat:-33.5182, lng:-70.6022, type:"transition", segment:"l5-regreso", pm25:32, pmPeak:38, humidity:37, temp:21.7, db:74, cfu:0, crowd:40, weather:"rain" },
  { id:"mirador-regreso", name:"Mirador", displayName:"Mirador v.", line:"L5", direction:"Regreso", lat:-33.5138, lng:-70.6057, type:"surface", segment:"l5-regreso", pm25:26, pmPeak:32, humidity:36, temp:21.6, db:71, cfu:0, crowd:30, weather:"rain" },
  { id:"pedrero-regreso", name:"Pedrero", displayName:"Pedrero v.", line:"L5", direction:"Regreso", lat:-33.5072, lng:-70.6099, type:"surface", segment:"l5-regreso", pm25:20, pmPeak:26, humidity:37, temp:21.5, db:69, cfu:0, crowd:25, weather:"rain" },
  { id:"san-joaquin-regreso", name:"San Joaquín", displayName:"San Joaquín v.", line:"L5", direction:"Regreso", lat:-33.4994, lng:-70.6158, type:"surface", segment:"l5-regreso", pm25:14, pmPeak:20, humidity:38, temp:21.3, db:66, cfu:0, crowd:20, weather:"rain" },
  { id:"sala-final", name:"Camino a la sala", displayName:"Sala final", line:"Exterior", direction:"Final", lat:-33.49664, lng:-70.61014, type:"walking", segment:"vuelta-sala", pm25:12, pmPeak:14, humidity:39, temp:21.2, db:55, cfu:0, crowd:5, weather:"rain" },
]

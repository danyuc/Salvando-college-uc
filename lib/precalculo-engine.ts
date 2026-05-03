export type Difficulty = "baja" | "media" | "alta"
export type PrecalculoModulo = "modulo_1" | "modulo_2" | "modulo_3" | "modulo_4" | "modulo_5" | "modulo_6" | "modulo_7"

export type PrecalculoQuestion = {
  asignatura: "Precálculo"
  modulo: PrecalculoModulo
  unidad: string
  tema: string
  subtema: string
  evaluaciones: string[]
  origen: "normal" | "prueba_real"
  tipo: "seleccion_multiple" | "desarrollo"
  dificultad: Difficulty
  tags: string[]
  pregunta: string
  opciones: string[]
  respuesta_correcta: string
  explanation: string
  pasos: any[]
  animaciones: any[]
  operacion_visual: any[]
  visualizacion: any
  deteccion_errores: any[]
  adaptatividad: any
  pista: string
  error_comun: string
  mini_refuerzo: string
}

const META = {
  modulo_1: { unidad: "Recta y parábola", evaluaciones: ["I1", "EXAMEN"] },
  modulo_2: { unidad: "Inecuaciones", evaluaciones: ["I1", "EXAMEN"] },
  modulo_3: { unidad: "Funciones reales", evaluaciones: ["I2", "EXAMEN"] },
  modulo_4: { unidad: "Exponenciales y logaritmos", evaluaciones: ["I2", "EXAMEN"] },
  modulo_5: { unidad: "Trigonometría", evaluaciones: ["I3", "EXAMEN"] },
  modulo_6: { unidad: "Polinomios", evaluaciones: ["EXAMEN"] },
  modulo_7: { unidad: "Sucesiones y sumas", evaluaciones: ["EXAMEN"] },
} as const

function r(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(x: T[]) {
  return [...x].sort(() => Math.random() - 0.5)
}

function base(input: Partial<PrecalculoQuestion> & { modulo: PrecalculoModulo; subtema: string }): PrecalculoQuestion {
  const meta = META[input.modulo]
  return {
    asignatura: "Precálculo",
    modulo: input.modulo,
    unidad: meta.unidad,
    tema: input.tema ?? input.subtema,
    subtema: input.subtema,
    evaluaciones: [...meta.evaluaciones],
    origen: input.origen ?? "normal",
    tipo: input.tipo ?? "seleccion_multiple",
    dificultad: input.dificultad ?? "media",
    tags: input.tags ?? ["MAT1000", input.subtema],
    pregunta: input.pregunta ?? "",
    opciones: input.opciones ?? [],
    respuesta_correcta: input.respuesta_correcta ?? "",
    explanation: input.explanation ?? "",
    pasos: input.pasos ?? [],
    animaciones: input.animaciones ?? [],
    operacion_visual: input.operacion_visual ?? [],
    visualizacion: input.visualizacion ?? { requiere_visual: false, tipo_visual: "ninguno", parametros: {} },
    deteccion_errores: input.deteccion_errores ?? [],
    adaptatividad: input.adaptatividad ?? {
      nivel: "normal",
      habilidad: input.subtema,
      si_falla: "Bajar dificultad y mostrar más pasos.",
      si_acierta: "Subir dificultad.",
    },
    pista: input.pista ?? "Identifica la fórmula antes de operar.",
    error_comun: input.error_comun ?? "Saltar pasos algebraicos.",
    mini_refuerzo: input.mini_refuerzo ?? "Repite un ejercicio similar con valores distintos.",
  }
}

export function generateQuestion(input: {
  modulo?: PrecalculoModulo
  subtema?: string
  dificultad?: Difficulty
  origen?: "normal" | "prueba_real"
} = {}): PrecalculoQuestion {
  const subtema = input.subtema ?? "Distancia entre puntos"
  const dificultad = input.dificultad ?? "media"

  if (subtema.includes("Recta") || subtema.includes("Ecuación de la recta")) return recta(dificultad, input.origen)
  if (subtema.includes("Inecuaciones lineales")) return inecuacionLineal(dificultad, input.origen)
  if (subtema.includes("Dominio")) return dominioRaiz(dificultad, input.origen)
  if (subtema.includes("Composición")) return composicion(dificultad, input.origen)
  if (subtema.includes("Función inversa")) return inversa(dificultad, input.origen)
  if (subtema.includes("Ecuaciones exponenciales")) return exponencial(dificultad, input.origen)
  if (subtema.includes("Ecuaciones logarítmicas")) return logaritmo(dificultad, input.origen)
  if (subtema.includes("Modelamiento cuadrático")) return modelamientoCuadratico(dificultad, input.origen)
  if (subtema.includes("Modelamiento exponencial")) return modelamientoExponencial(dificultad, input.origen)

  return distancia(dificultad, input.origen)
}

export function generatePracticeSet(input: {
  modulo?: PrecalculoModulo
  subtema?: string
  dificultad?: Difficulty
  cantidad?: number
  origen?: "normal" | "prueba_real"
} = {}) {
  const cantidad = input.cantidad ?? 10
  return Array.from({ length: cantidad }, () =>
    generateQuestion({
      modulo: input.modulo,
      subtema: input.subtema,
      dificultad: input.dificultad ?? "media",
      origen: input.origen ?? "normal",
    })
  )
}

export function generateDiagnosticSet() {
  const plan = [
    "Distancia entre puntos",
    "Ecuación de la recta",
    "Inecuaciones lineales",
    "Dominio",
    "Composición de funciones",
    "Función inversa",
    "Ecuaciones exponenciales",
    "Ecuaciones logarítmicas",
    "Distancia entre puntos",
    "Ecuación de la recta",
    "Dominio",
    "Composición de funciones",
  ]

  return plan.map((subtema, i) =>
    generateQuestion({
      subtema,
      dificultad: i < 4 ? "baja" : i < 9 ? "media" : "alta",
      origen: "prueba_real",
    })
  )
}

function distancia(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const max = dificultad === "alta" ? 8 : 5
  const x1 = r(-max, max)
  const y1 = r(-max, max)
  let x2 = r(-max, max)
  let y2 = r(-max, max)
  if (x1 === x2 && y1 === y2) x2++

  const dx = x2 - x1
  const dy = y2 - y1
  const rad = dx * dx + dy * dy
  const ans = Number.isInteger(Math.sqrt(rad)) ? String(Math.sqrt(rad)) : `√${rad}`

  return base({
    modulo: "modulo_1",
    subtema: "Distancia entre puntos",
    origen,
    dificultad,
    tema: "Geometría analítica",
    pregunta: `Calcula la distancia entre A(${x1}, ${y1}) y B(${x2}, ${y2}).`,
    opciones: shuffle([ans, String(Math.abs(dx) + Math.abs(dy)), `√${Math.abs(dx) + Math.abs(dy)}`, `√${rad + 4}`]),
    respuesta_correcta: ans,
    explanation: `d = √[(${x2} - ${x1})² + (${y2} - ${y1})²] = √(${dx * dx} + ${dy * dy}) = ${ans}.`,
    pasos: [
      { orden: 1, titulo: "Restar coordenadas", explicacion: `Δx=${dx}, Δy=${dy}`, expresion: `(${x2}-${x1}), (${y2}-${y1})` },
      { orden: 2, titulo: "Aplicar distancia", explicacion: "Se elevan al cuadrado y se suma.", expresion: `√(${dx * dx}+${dy * dy})` },
    ],
    visualizacion: {
      requiere_visual: true,
      tipo_visual: "plano_cartesiano",
      parametros: {
        puntos: [
          { etiqueta: "A", x: x1, y: y1 },
          { etiqueta: "B", x: x2, y: y2 },
        ],
      },
    },
  })
}

function recta(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const m = r(-5, 5) || 2
  const b = r(-6, 6)
  const x = r(-4, 4)
  const y = m * x + b
  const ans = `y = ${m}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}`

  return base({
    modulo: "modulo_1",
    subtema: "Ecuación de la recta",
    origen,
    dificultad,
    pregunta: `Una recta tiene pendiente ${m} y pasa por el punto (${x}, ${y}). ¿Cuál es su ecuación?`,
    opciones: shuffle([ans, `y = ${b}x + ${m}`, `y = ${m}x ${-b >= 0 ? "+" : "-"} ${Math.abs(-b)}`, `y = ${x}x + ${y}`]),
    respuesta_correcta: ans,
    explanation: `Usamos y = mx + b. Como ${y} = ${m}·${x} + b, entonces b = ${b}.`,
    pasos: [
      { orden: 1, titulo: "Modelo", explicacion: "La forma pendiente-intercepto es y = mx + b.", expresion: "y = mx + b" },
      { orden: 2, titulo: "Sustituir", explicacion: `Se reemplaza m=${m}, x=${x}, y=${y}.`, expresion: `${y}=${m}(${x})+b` },
    ],
  })
}

function inecuacionLineal(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const a = r(2, 6)
  const b = r(-8, 8)
  const c = r(1, 12)
  const val = (c - b) / a
  const ans = `x > ${val}`

  return base({
    modulo: "modulo_2",
    subtema: "Inecuaciones lineales",
    origen,
    dificultad,
    pregunta: `Resuelve la inecuación ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} > ${c}.`,
    opciones: shuffle([ans, `x < ${val}`, `x > ${c + b}`, `x < ${a + c}`]),
    respuesta_correcta: ans,
    explanation: `Se despeja: ${a}x > ${c - b}, entonces x > ${val}.`,
  })
}

function dominioRaiz(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const a = r(1, 6)
  const ans = `[${a}, ∞)`

  return base({
    modulo: "modulo_3",
    subtema: "Dominio",
    origen,
    dificultad,
    pregunta: `Determina el dominio de f(x)=√(x-${a}).`,
    opciones: shuffle([ans, `(${a}, ∞)`, `(-∞, ${a}]`, "R"]),
    respuesta_correcta: ans,
    explanation: `Para que exista la raíz: x-${a} ≥ 0, entonces x ≥ ${a}.`,
    visualizacion: {
      requiere_visual: true,
      tipo_visual: "recta_real",
      parametros: {},
    },
  })
}

function composicion(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const a = r(2, 5)
  const b = r(1, 5)
  const ans = `${a}x + ${a * b + 1}`

  return base({
    modulo: "modulo_3",
    subtema: "Composición de funciones",
    origen,
    dificultad,
    pregunta: `Sean f(x)=${a}x+1 y g(x)=x+${b}. Calcula (f∘g)(x).`,
    opciones: shuffle([ans, `${a}x + ${b + 1}`, `${a}x + ${b}`, `${a}x + ${a + b}`]),
    respuesta_correcta: ans,
    explanation: `(f∘g)(x)=f(g(x))=${a}(x+${b})+1=${ans}.`,
  })
}

function inversa(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const a = r(2, 6)
  const b = r(1, 6)
  const ans = `(x-${b})/${a}`

  return base({
    modulo: "modulo_3",
    subtema: "Función inversa",
    origen,
    dificultad,
    pregunta: `Si f(x)=${a}x+${b}, ¿cuál es f⁻¹(x)?`,
    opciones: shuffle([ans, `${a}/(x-${b})`, `(x+${b})/${a}`, `${a}x-${b}`]),
    respuesta_correcta: ans,
    explanation: `y=${a}x+${b}. Intercambiamos x e y: x=${a}y+${b}. Despejamos: y=(x-${b})/${a}.`,
  })
}

function exponencial(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const n = r(2, 5)
  const ans = String(n)

  return base({
    modulo: "modulo_4",
    subtema: "Ecuaciones exponenciales",
    origen,
    dificultad,
    pregunta: `Resuelve 2^x = ${2 ** n}.`,
    opciones: shuffle([ans, String(n + 1), String(n - 1), String(2 ** n)]),
    respuesta_correcta: ans,
    explanation: `Como ${2 ** n}=2^${n}, entonces x=${n}.`,
  })
}

function logaritmo(dificultad: Difficulty, origen: "normal" | "prueba_real" = "normal") {
  const n = r(2, 5)
  const ans = String(n)

  return base({
    modulo: "modulo_4",
    subtema: "Ecuaciones logarítmicas",
    origen,
    dificultad,
    pregunta: `Resuelve log₂(x) = ${n}.`,
    opciones: shuffle([ans === String(n) ? String(2 ** n) : ans, String(n), String(2 ** n + 1), String(2 ** (n - 1))]),
    respuesta_correcta: String(2 ** n),
    explanation: `log₂(x)=${n} significa x=2^${n}=${2 ** n}.`,
  })
}


function modelamientoCuadratico(dificultad: Difficulty, origen: "normal" | "prueba_real" = "prueba_real") {
  const h0 = r(8, 20)
  const v0 = r(6, 14)
  const t = r(1, 3)
  const altura = -5 * t * t + v0 * t + h0
  const ans = String(altura)

  return base({
    modulo: "modulo_1",
    subtema: "Modelamiento cuadrático",
    origen,
    dificultad,
    tema: "Modelamiento",
    pregunta: `Un objeto se lanza verticalmente y su altura está dada por h(t) = -5t² + ${v0}t + ${h0}. ¿Cuál es la altura a los ${t} segundos?`,
    opciones: shuffle([ans, String(altura + 5), String(Math.abs(altura - 5)), String(h0 + v0 * t)]),
    respuesta_correcta: ans,
    explanation: `Se evalúa el modelo en t=${t}: h(${t}) = -5(${t})² + ${v0}(${t}) + ${h0} = ${altura}.`,
    pasos: [
      { orden: 1, titulo: "Identificar el modelo", explicacion: "La función entrega la altura según el tiempo.", expresion: `h(t) = -5t² + ${v0}t + ${h0}` },
      { orden: 2, titulo: "Sustituir el tiempo", explicacion: `Reemplazamos t por ${t}.`, expresion: `h(${t}) = -5(${t})² + ${v0}(${t}) + ${h0}` },
      { orden: 3, titulo: "Calcular", explicacion: "Se respeta el orden de operaciones.", expresion: `h(${t}) = ${altura}` },
    ],
  })
}

function modelamientoExponencial(dificultad: Difficulty, origen: "normal" | "prueba_real" = "prueba_real") {
  const inicial = r(100, 400)
  const tasa = 2
  const tiempo = r(2, 5)
  const ans = String(inicial * 2 ** tiempo)

  return base({
    modulo: "modulo_4",
    subtema: "Modelamiento exponencial y logarítmico",
    origen,
    dificultad,
    tema: "Modelamiento",
    pregunta: `Una población inicial de ${inicial} bacterias se duplica cada hora. ¿Cuántas bacterias habrá después de ${tiempo} horas?`,
    opciones: shuffle([ans, String(inicial * tiempo), String(inicial + tasa * tiempo), String(inicial * 2 ** (tiempo - 1))]),
    respuesta_correcta: ans,
    explanation: `Como se duplica cada hora, el modelo es P(t)=${inicial}·2^t. Entonces P(${tiempo})=${ans}.`,
    pasos: [
      { orden: 1, titulo: "Elegir modelo", explicacion: "Cuando una cantidad se duplica, se usa crecimiento exponencial.", expresion: `P(t)=${inicial}·2^t` },
      { orden: 2, titulo: "Evaluar", explicacion: `Reemplazamos t=${tiempo}.`, expresion: `P(${tiempo})=${inicial}·2^${tiempo}` },
    ],
  })
}

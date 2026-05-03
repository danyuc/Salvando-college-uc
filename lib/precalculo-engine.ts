export type Difficulty = "baja" | "media" | "alta"

export const PRECALCULO_SYLLABUS = {
  modulo_1: {
    unidad: "Ecuaciones de la recta y la parábola",
    evaluaciones: ["I1", "EXAMEN"],
    subtemas: [
      "Distancia entre puntos",
      "Intersección con ejes coordenados",
      "Ecuación de la recta",
      "Rectas paralelas y perpendiculares",
      "Sistemas lineales 2x2",
      "Parábola y modelos cuadráticos",
    ],
  },
  modulo_2: {
    unidad: "Inecuaciones",
    evaluaciones: ["I1", "EXAMEN"],
    subtemas: [
      "Orden en los reales",
      "Intervalos",
      "Inecuaciones lineales",
      "Inecuaciones cuadráticas",
      "Inecuaciones racionales",
      "Tabla de signos",
      "Valor absoluto",
    ],
  },
  modulo_3: {
    unidad: "Funciones reales",
    evaluaciones: ["I2", "EXAMEN"],
    subtemas: [
      "Concepto de función",
      "Dominio",
      "Recorrido",
      "Gráficas básicas",
      "Transformaciones de funciones",
      "Álgebra de funciones",
      "Composición de funciones",
      "Funciones inyectivas",
      "Función inversa",
      "Funciones por tramos",
    ],
  },
  modulo_4: {
    unidad: "Funciones exponenciales y logarítmicas",
    evaluaciones: ["I2", "EXAMEN"],
    subtemas: [
      "Función exponencial",
      "Transformaciones exponenciales",
      "Propiedades de exponentes",
      "Función logarítmica",
      "Logaritmo como inversa",
      "Propiedades de logaritmos",
      "Ecuaciones exponenciales",
      "Ecuaciones logarítmicas",
    ],
  },
  modulo_5: {
    unidad: "Funciones trigonométricas",
    evaluaciones: ["I3", "EXAMEN"],
    subtemas: [
      "Razones trigonométricas",
      "Circunferencia unitaria",
      "Radianes",
      "Ángulos notables",
      "Gráficas seno y coseno",
      "Amplitud",
      "Período",
      "Desfase",
      "Identidades trigonométricas",
      "Funciones trigonométricas inversas",
    ],
  },
  modulo_6: {
    unidad: "Funciones polinomiales",
    evaluaciones: ["EXAMEN"],
    subtemas: [
      "Polinomios",
      "Ceros de polinomios",
      "Multiplicidad",
      "Comportamiento al infinito",
      "División polinomial",
      "Teorema del factor",
      "Gráfica de polinomios",
    ],
  },
  modulo_7: {
    unidad: "Sucesiones y sumas",
    evaluaciones: ["EXAMEN"],
    subtemas: [
      "Sucesiones",
      "Sucesiones aritméticas",
      "Sucesiones geométricas",
      "Notación sigma",
      "Sumas finitas",
      "Modelos discretos",
    ],
  },
} as const

export type PrecalculoModulo = keyof typeof PRECALCULO_SYLLABUS

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
  pasos: Array<{
    orden: number
    titulo: string
    explicacion: string
    expresion: string
    transformacion?: string
    accion_visual: string
    highlight: string[]
    errores_posibles: string[]
  }>
  animaciones: Array<{
    paso: number
    tipo: string
    objetivo: string
    descripcion: string
  }>
  operacion_visual: Array<{
    orden: number
    tipo: string
    antes: string
    despues: string
    animacion: string
  }>
  visualizacion: {
    requiere_visual: boolean
    tipo_visual: string
    descripcion: string
    parametros: Record<string, unknown>
  }
  deteccion_errores: Array<{
    tipo: string
    descripcion: string
    trigger: string
  }>
  adaptatividad: {
    nivel: "refuerzo" | "normal" | "desafio"
    habilidad: string
    si_falla: string
    si_acierta: string
  }
  pista: string
  error_comun: string
  mini_refuerzo: string
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function uniqueOptions(options: string[]) {
  return Array.from(new Set(options)).slice(0, 4)
}

export function generateQuestion(input: {
  modulo?: PrecalculoModulo
  subtema?: string
  dificultad?: Difficulty
  origen?: "normal" | "prueba_real"
} = {}): PrecalculoQuestion {
  const modulo = input.modulo ?? "modulo_1"
  const dificultad = input.dificultad ?? "media"
  const subtema = input.subtema ?? "Distancia entre puntos"

  if (subtema === "Distancia entre puntos") {
    return generateDistanceQuestion(modulo, dificultad, input.origen ?? "normal")
  }

  return generateDistanceQuestion("modulo_1", dificultad, input.origen ?? "normal")
}

export function generatePracticeSet(input: {
  modulo?: PrecalculoModulo
  subtema?: string
  dificultad?: Difficulty
  cantidad?: number
  origen?: "normal" | "prueba_real"
} = {}) {
  const cantidad = input.cantidad ?? 10

  return Array.from({ length: cantidad }, (_, index) =>
    generateQuestion({
      modulo: input.modulo ?? "modulo_1",
      subtema: input.subtema ?? "Distancia entre puntos",
      dificultad: input.dificultad ?? (index % 3 === 0 ? "baja" : index % 3 === 1 ? "media" : "alta"),
      origen: input.origen ?? (index % 3 === 0 ? "prueba_real" : "normal"),
    })
  )
}

function generateDistanceQuestion(
  modulo: PrecalculoModulo,
  dificultad: Difficulty,
  origen: "normal" | "prueba_real"
): PrecalculoQuestion {
  const max = dificultad === "alta" ? 14 : dificultad === "media" ? 9 : 5

  const x1 = randomInt(-max, max)
  const y1 = randomInt(-max, max)
  let x2 = randomInt(-max, max)
  let y2 = randomInt(-max, max)

  if (x1 === x2 && y1 === y2) x2 += 1

  const dx = x2 - x1
  const dy = y2 - y1
  const radicando = dx * dx + dy * dy
  const distancia = Math.sqrt(radicando)
  const correcta = Number.isInteger(distancia) ? String(distancia) : `√${radicando}`

  const opciones = uniqueOptions(
    shuffle([
      correcta,
      String(Math.abs(dx) + Math.abs(dy)),
      `√${Math.abs(dx) + Math.abs(dy)}`,
      String(Math.abs(dx * dy)),
      `√${Math.max(1, radicando + randomInt(2, 8))}`,
    ])
  )

  while (opciones.length < 4) opciones.push(`√${radicando + opciones.length + 3}`)

  const meta = PRECALCULO_SYLLABUS.modulo_1

  return {
    asignatura: "Precálculo",
    modulo: "modulo_1",
    unidad: meta.unidad,
    tema: "Geometría analítica",
    subtema: "Distancia entre puntos",
    evaluaciones: [...meta.evaluaciones],
    origen,
    tipo: "seleccion_multiple",
    dificultad,
    tags: ["plano cartesiano", "distancia", "pitágoras", "MAT1000"],
    pregunta: `Calcula la distancia entre A(${x1}, ${y1}) y B(${x2}, ${y2}).`,
    opciones,
    respuesta_correcta: correcta,
    explanation: `Se aplica d = √[(x₂ - x₁)² + (y₂ - y₁)²]. Aquí Δx = ${dx}, Δy = ${dy}, entonces d = √(${dx * dx} + ${dy * dy}) = ${correcta}.`,
    pasos: [
      {
        orden: 1,
        titulo: "Identificar puntos",
        explicacion: `Tomamos A(${x1}, ${y1}) como primer punto y B(${x2}, ${y2}) como segundo punto.`,
        expresion: `A(${x1}, ${y1}), B(${x2}, ${y2})`,
        transformacion: "Identificar x₁, y₁, x₂, y₂",
        accion_visual: "marcar_punto",
        highlight: ["A", "B"],
        errores_posibles: ["Confundir x con y", "Invertir coordenadas"],
      },
      {
        orden: 2,
        titulo: "Restar coordenadas",
        explicacion: `Calculamos las diferencias: Δx = ${x2} - ${x1} = ${dx} y Δy = ${y2} - ${y1} = ${dy}.`,
        expresion: `Δx = ${dx}, Δy = ${dy}`,
        transformacion: "Restar coordenadas correspondientes",
        accion_visual: "resaltar",
        highlight: ["Δx", "Δy"],
        errores_posibles: ["Restar cruzado", "Perder signos negativos"],
      },
      {
        orden: 3,
        titulo: "Aplicar fórmula",
        explicacion: "Elevamos ambas diferencias al cuadrado, sumamos y luego aplicamos raíz cuadrada.",
        expresion: `d = √((${dx})² + (${dy})²) = √${radicando}`,
        transformacion: `√(${dx * dx} + ${dy * dy})`,
        accion_visual: "simplificar",
        highlight: ["√", `${radicando}`],
        errores_posibles: ["Olvidar la raíz", "Sumar sin elevar al cuadrado"],
      },
    ],
    animaciones: [
      {
        paso: 1,
        tipo: "marcar_punto",
        objetivo: "A y B",
        descripcion: "Marca ambos puntos en el plano cartesiano.",
      },
      {
        paso: 2,
        tipo: "resaltar",
        objetivo: "diferencias de coordenadas",
        descripcion: "Resalta Δx y Δy como catetos de un triángulo rectángulo.",
      },
      {
        paso: 3,
        tipo: "simplificar",
        objetivo: "radicando",
        descripcion: "Muestra la suma de cuadrados y la raíz final.",
      },
    ],
    operacion_visual: [
      {
        orden: 1,
        tipo: "grafica",
        antes: `A(${x1}, ${y1}), B(${x2}, ${y2})`,
        despues: "Segmento AB",
        animacion: "marcar_punto",
      },
      {
        orden: 2,
        tipo: "simplificacion",
        antes: `√((${dx})² + (${dy})²)`,
        despues: correcta,
        animacion: "simplificar",
      },
    ],
    visualizacion: {
      requiere_visual: true,
      tipo_visual: "plano_cartesiano",
      descripcion: "Plano cartesiano con puntos A y B y segmento de distancia.",
      parametros: {
        xmin: -max,
        xmax: max,
        ymin: -max,
        ymax: max,
        puntos: [
          { etiqueta: "A", x: x1, y: y1 },
          { etiqueta: "B", x: x2, y: y2 },
        ],
        segmento: [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
        ],
      },
    },
    deteccion_errores: [
      {
        tipo: "procedimental",
        descripcion: "Confunde la fórmula de distancia con pendiente.",
        trigger: "usa_dy_sobre_dx",
      },
      {
        tipo: "algebraico",
        descripcion: "Pierde signos negativos al restar coordenadas.",
        trigger: "signos_en_delta",
      },
      {
        tipo: "conceptual",
        descripcion: "Olvida aplicar raíz cuadrada al final.",
        trigger: "responde_radicando",
      },
    ],
    adaptatividad: {
      nivel: dificultad === "baja" ? "refuerzo" : dificultad === "alta" ? "desafio" : "normal",
      habilidad: "rectas",
      si_falla: "Generar una pregunta con puntos positivos y diferencias pequeñas.",
      si_acierta: "Aumentar dificultad usando coordenadas negativas o distancia no entera.",
    },
    pista: "Primero calcula x₂ - x₁ e y₂ - y₁. Después eleva al cuadrado, suma y saca raíz.",
    error_comun: "Responder el radicando sin sacar raíz.",
    mini_refuerzo: "La fórmula de distancia viene del Teorema de Pitágoras aplicado al triángulo formado entre los puntos.",
  }
}

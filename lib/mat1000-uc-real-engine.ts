import { generateQuestion } from "./precalculo-engine"
import { resolveModuloIdFromLabel } from "./precalculo-ui-options"

export type Mat1000Evaluation = "I1" | "I2" | "I3" | "EXAMEN"
export type Mat1000Mode = "practica" | "interrogacion" | "examen"

export type Mat1000UCQuestion = ReturnType<typeof generateQuestion> & {
  formato_uc?: "alternativa" | "desarrollo_modelamiento"
  patron_uc?: string
}

const evaluationModules: Record<Mat1000Evaluation, string[]> = {
  I1: ["Módulo 1: Recta y parábola", "Módulo 2: Inecuaciones"],
  I2: ["Módulo 3: Funciones reales", "Módulo 4: Exponenciales y logaritmos"],
  I3: ["Módulo 5: Trigonometría"],
  EXAMEN: [
    "Módulo 1: Recta y parábola",
    "Módulo 2: Inecuaciones",
    "Módulo 3: Funciones reales",
    "Módulo 4: Exponenciales y logaritmos",
    "Módulo 5: Trigonometría",
    "Módulo 6: Polinomios",
    "Módulo 7: Sucesiones y sumas",
  ],
}

const subtemasByEvaluation: Record<Mat1000Evaluation, string[]> = {
  I1: [
    "Distancia entre puntos",
    "Intersección con ejes coordenados",
    "Ecuación de la recta",
    "Rectas paralelas y perpendiculares",
    "Parábola y modelos cuadráticos",
    "Inecuaciones lineales",
    "Inecuaciones cuadráticas",
    "Inecuaciones racionales",
    "Valor absoluto",
    "Modelamiento cuadrático",
  ],
  I2: [
    "Funciones por tramos",
    "Dominio",
    "Recorrido",
    "Transformaciones de funciones",
    "Composición de funciones",
    "Función inversa",
    "Función exponencial",
    "Función logarítmica",
    "Ecuaciones exponenciales",
    "Ecuaciones logarítmicas",
    "Modelamiento exponencial y logarítmico",
  ],
  I3: [
    "Razones trigonométricas",
    "Circunferencia unitaria",
    "Ángulos notables",
    "Identidades trigonométricas",
    "Funciones trigonométricas inversas",
    "Polinomios",
    "División polinomial",
    "Teorema del factor",
    "Modelamiento trigonométrico",
  ],
  EXAMEN: [
    "Intervalos",
    "Inecuaciones racionales",
    "Función inversa",
    "Transformaciones de funciones",
    "Identidades trigonométricas",
    "Polinomios",
    "Ceros de polinomios",
    "División polinomial",
    "Sucesiones aritméticas",
    "Sucesiones geométricas",
    "Sumas finitas",
    "Modelos discretos",
  ],
}

const developmentPatterns: Record<Mat1000Evaluation, string[]> = {
  I1: [
    "recta paralela/perpendicular con intersecciones",
    "inecuación racional con tabla de signos",
    "modelamiento cuadrático de optimización",
  ],
  I2: [
    "función por tramos con gráfico, recorrido e inyectividad",
    "ecuación exponencial con cambio de variable",
    "modelamiento con composición o inversa",
  ],
  I3: [
    "identidad trigonométrica",
    "función sinusoidal: amplitud, período y desfase",
    "modelamiento trigonométrico con triángulos",
  ],
  EXAMEN: [
    "polinomio: raíces racionales, factorización y gráfico",
    "función con raíz racional: dominio e inversa",
    "sucesiones, sumas o serie geométrica aplicada",
  ],
}

function pick<T>(arr: T[], index: number) {
  return arr[index % arr.length]
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function asUCQuestion(q: ReturnType<typeof generateQuestion>, formato: "alternativa" | "desarrollo_modelamiento", patron: string): Mat1000UCQuestion {
  return {
    ...q,
    formato_uc: formato,
    patron_uc: patron,
    origen: "prueba_real",
    dificultad: formato === "desarrollo_modelamiento" ? "alta" : q.dificultad,
  }
}

export function generateMat1000UCExam(input: {
  evaluation: Mat1000Evaluation
  selectedModuleLabel?: string
  selectedSubtema?: string
  includeAllExamModules?: boolean
}) {
  const evaluation = input.evaluation || "I1"

  const allowedModules =
    evaluation === "EXAMEN" || input.includeAllExamModules
      ? evaluationModules[evaluation]
      : evaluationModules[evaluation]

  const selectedModule =
    input.selectedModuleLabel && allowedModules.includes(input.selectedModuleLabel)
      ? input.selectedModuleLabel
      : allowedModules[0]

  const modulo = resolveModuloIdFromLabel(selectedModule) as any

  const baseSubtemas = subtemasByEvaluation[evaluation]
  const selectedSubtema =
    input.selectedSubtema && baseSubtemas.includes(input.selectedSubtema)
      ? input.selectedSubtema
      : undefined

  const alternativas = Array.from({ length: 10 }).map((_, index) => {
    const subtema = selectedSubtema || pick(baseSubtemas, index)
    const q = generateQuestion({
      modulo,
      subtema,
      dificultad: index < 4 ? "media" : "alta",
      origen: "prueba_real",
    })

    return asUCQuestion(q, "alternativa", `alternativa UC ${evaluation}`)
  })

  const desarrollos = developmentPatterns[evaluation].map((patron, index) => {
    const subtema =
      patron.includes("recta") ? "Ecuación de la recta" :
      patron.includes("inecuación") ? "Inecuaciones racionales" :
      patron.includes("cuadrático") ? "Modelamiento cuadrático" :
      patron.includes("tramos") ? "Funciones por tramos" :
      patron.includes("exponencial") ? "Ecuaciones exponenciales" :
      patron.includes("inversa") ? "Función inversa" :
      patron.includes("identidad") ? "Identidades trigonométricas" :
      patron.includes("sinusoidal") ? "Gráficas seno y coseno" :
      patron.includes("trigonométrico") ? "Modelamiento trigonométrico" :
      patron.includes("polinomio") ? "Polinomios" :
      patron.includes("raíz racional") ? "Dominio" :
      "Sucesiones geométricas"

    const q = generateQuestion({
      modulo,
      subtema,
      dificultad: "alta",
      origen: "prueba_real",
    })

    return asUCQuestion(
      {
        ...q,
        tipo: "desarrollo",
        opciones: [],
        pregunta: `Desarrollo tipo UC: ${q.pregunta}`,
        respuesta_correcta: q.explanation || q.respuesta_correcta,
      },
      "desarrollo_modelamiento",
      patron
    )
  })

  return [...alternativas, ...desarrollos]
}

export function generateMat1000Practice(input: {
  evaluation: Mat1000Evaluation
  moduleLabel?: string
  subtema?: string
  cantidad?: number
}) {
  const cantidad = input.cantidad || 20
  const evaluation = input.evaluation || "I1"
  const allowed = subtemasByEvaluation[evaluation]
  const subtemas = input.subtema && allowed.includes(input.subtema) ? [input.subtema] : allowed
  const moduleLabel = input.moduleLabel || evaluationModules[evaluation][0]
  const modulo = resolveModuloIdFromLabel(moduleLabel) as any

  return shuffle(
    Array.from({ length: cantidad }).map((_, index) =>
      generateQuestion({
        modulo,
        subtema: pick(subtemas, index),
        dificultad: index < cantidad * 0.35 ? "media" : "alta",
        origen: "prueba_real",
      })
    )
  )
}

export function getMat1000AllowedModules(evaluation: Mat1000Evaluation) {
  return evaluationModules[evaluation] || evaluationModules.I1
}

export function getMat1000AllowedSubtemas(evaluation: Mat1000Evaluation) {
  return subtemasByEvaluation[evaluation] || subtemasByEvaluation.I1
}

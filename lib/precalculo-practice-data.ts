export type PrecalculoTopicKey =
  | "algebra"
  | "funciones"
  | "geometria"
  | "exponentes"
  | "logaritmos"
  | "razones-trig"
  | "cuadrantes"
  | "seno-coseno"
  | "amplitud"
  | "periodo"
  | "desfase"
  | "modelamiento"
  | "lectura-grafica"

export type GraphConfig =
  | { type: "none" }
  | { type: "line"; points: Array<{ x: number; y: number }>; slope?: number; intercept?: number }
  | { type: "trig"; amplitude: number; k: number; b: number; c: number }
  | { type: "points"; points: Array<{ x: number; y: number; label: string }> }

export type PrecalculoLearningQuestion = {
  id: string
  module: string
  topic: PrecalculoTopicKey
  topicLabel: string
  difficulty: "Base" | "Media" | "Alta"
  prompt: string
  choices: [string, string, string, string]
  answerIndex: number
  explanation: string
  steps: string[]
  formulas: string[]
  proMax: {
    why: string
    commonMistake: string
    testTip: string
    workedExample: string
  }
  graph: GraphConfig
}

export const PRECALCULO_DIAGNOSTIC_13: PrecalculoLearningQuestion[] = [
  {
    id: "diag-algebra-2x",
    module: "I1",
    topic: "algebra",
    topicLabel: "Álgebra básica",
    difficulty: "Base",
    prompt: "Resuelve 10 + 2x = 30.",
    choices: ["x = 5", "x = 10", "x = 20", "x = 40"],
    answerIndex: 1,
    explanation: "Restamos 10 y luego dividimos por 2: 2x = 20, entonces x = 10.",
    steps: [
      "Restamos 10 a ambos lados: 2x = 30 - 10 = 20.",
      "Dividimos por 2: x = 20 / 2 = 10.",
      "Respuesta: x = 10.",
    ],
    formulas: ["Si a + bx = c, entonces bx = c - a."],
    proMax: {
      why: "Es despeje lineal directo.",
      commonMistake: "Dividir por 2 antes de restar 10.",
      testTip: "Haz una verificación rápida: 10 + 2·10 = 30.",
      workedExample: "Con 8 + 4x = 20: 4x = 12, x = 3.",
    },
    graph: { type: "none" },
  },
  {
    id: "diag-funciones-composicion",
    module: "I1",
    topic: "funciones",
    topicLabel: "Funciones y composición",
    difficulty: "Media",
    prompt: "Si f(x) = 2x + 1 y g(x) = x² - 3, calcula (f∘g)(4).",
    choices: ["13", "24", "27", "31"],
    answerIndex: 2,
    explanation: "Primero g(4) = 13 y luego f(13) = 27.",
    steps: [
      "La composición (f∘g)(4) significa f(g(4)).",
      "Calculamos g(4) = 4² - 3 = 16 - 3 = 13.",
      "Aplicamos f al resultado: f(13) = 2·13 + 1 = 27.",
      "Respuesta: 27.",
    ],
    formulas: ["(f∘g)(x) = f(g(x))"],
    proMax: {
      why: "La función de adentro se calcula primero.",
      commonMistake: "Hacer g(f(4)) en lugar de f(g(4)).",
      testTip: "Subraya el orden: f∘g = f después de g.",
      workedExample: "Si g(2) = 1 y f(x) = 3x, entonces f(g(2)) = 3.",
    },
    graph: { type: "none" },
  },
  {
    id: "diag-geometria-distancia",
    module: "I1",
    topic: "geometria",
    topicLabel: "Geometría analítica",
    difficulty: "Base",
    prompt: "Calcula la distancia entre A(2,3) y B(6,6).",
    choices: ["4", "5", "7", "25"],
    answerIndex: 1,
    explanation: "Las diferencias son 4 y 3; por Pitágoras la distancia es 5.",
    steps: [
      "Identifica x1 = 2, y1 = 3, x2 = 6, y2 = 6.",
      "d = √((6 - 2)² + (6 - 3)²).",
      "d = √(4² + 3²) = √(16 + 9) = √25.",
      "Respuesta: d = 5.",
    ],
    formulas: ["d = √((x2 - x1)² + (y2 - y1)²)"],
    proMax: {
      why: "Dos puntos y una longitud piden distancia.",
      commonMistake: "Restar x con y o olvidar los cuadrados.",
      testTip: "Si ves 3-4-5, marca rápido pero verifica signos.",
      workedExample: "Entre (1,1) y (4,5): d = √(3² + 4²) = 5.",
    },
    graph: { type: "points", points: [{ x: 2, y: 3, label: "A" }, { x: 6, y: 6, label: "B" }] },
  },
  {
    id: "diag-exponentes",
    module: "I2",
    topic: "exponentes",
    topicLabel: "Potencias y exponentes",
    difficulty: "Base",
    prompt: "Simplifica 2³ · 2⁴.",
    choices: ["2⁷", "2¹²", "4⁷", "16"],
    answerIndex: 0,
    explanation: "Al multiplicar potencias de igual base, sumamos exponentes: 3 + 4 = 7.",
    steps: [
      "La base es la misma: 2.",
      "Usamos a^m · a^n = a^(m+n).",
      "2³ · 2⁴ = 2^(3+4) = 2⁷.",
      "Respuesta: 2⁷.",
    ],
    formulas: ["a^m · a^n = a^(m+n)"],
    proMax: {
      why: "Misma base y multiplicación.",
      commonMistake: "Multiplicar exponentes: 3·4.",
      testTip: "Solo sumas exponentes cuando las bases son iguales.",
      workedExample: "5² · 5³ = 5⁵.",
    },
    graph: { type: "none" },
  },
  {
    id: "diag-logaritmos",
    module: "I2",
    topic: "logaritmos",
    topicLabel: "Logaritmos",
    difficulty: "Base",
    prompt: "Calcula log₂(32).",
    choices: ["4", "5", "16", "30"],
    answerIndex: 1,
    explanation: "log₂(32) pregunta: 2 elevado a qué da 32. Como 2⁵ = 32, vale 5.",
    steps: [
      "Traducimos: log₂(32) = ? significa 2^? = 32.",
      "Probamos potencias: 2⁵ = 32.",
      "Entonces log₂(32) = 5.",
      "Respuesta: 5.",
    ],
    formulas: ["log_b(a) = c ⇔ b^c = a"],
    proMax: {
      why: "Es definición directa de logaritmo.",
      commonMistake: "Confundir log₂(32) con 32/2.",
      testTip: "Pasa a forma exponencial si dudas.",
      workedExample: "log₃(81) = 4 porque 3⁴ = 81.",
    },
    graph: { type: "none" },
  },
  {
    id: "diag-razones-trig",
    module: "I3",
    topic: "razones-trig",
    topicLabel: "Razones trigonométricas",
    difficulty: "Media",
    prompt: "En un triángulo rectángulo, si cateto opuesto = 3 e hipotenusa = 5, ¿cuál es sen(t)?",
    choices: ["3/5", "4/5", "5/3", "3/4"],
    answerIndex: 0,
    explanation: "Seno es cateto opuesto sobre hipotenusa: 3/5.",
    steps: [
      "Identificamos cateto opuesto = 3 e hipotenusa = 5.",
      "Usamos sen(t) = opuesto / hipotenusa.",
      "sen(t) = 3/5.",
      "Respuesta: 3/5.",
    ],
    formulas: ["sen(t) = opuesto / hipotenusa"],
    proMax: {
      why: "La pregunta entrega opuesto e hipotenusa.",
      commonMistake: "Usar coseno por confundir opuesto con adyacente.",
      testTip: "SOH-CAH-TOA: seno usa O/H.",
      workedExample: "Si opuesto = 5 e hipotenusa = 13, sen = 5/13.",
    },
    graph: { type: "points", points: [{ x: 0, y: 0, label: "O" }, { x: 4, y: 0, label: "A" }, { x: 4, y: 3, label: "B" }] },
  },
  {
    id: "diag-cuadrantes-signos",
    module: "I3",
    topic: "cuadrantes",
    topicLabel: "Cuadrantes y signos",
    difficulty: "Media",
    prompt: "Si t está en el tercer cuadrante y sen(t) = -12/13, ¿cuál es tan(t)?",
    choices: ["-12/5", "12/5", "-5/12", "5/12"],
    answerIndex: 1,
    explanation: "En QIII, seno y coseno son negativos, por eso tangente es positiva. Con triángulo 5-12-13, tan = 12/5.",
    steps: [
      "En QIII, seno < 0 y coseno < 0, entonces tangente > 0.",
      "Si sen(t) = y/r = -12/13, entonces y = -12 y r = 13.",
      "Pitágoras: x² + (-12)² = 13² ⇒ x² + 144 = 169 ⇒ x² = 25.",
      "x = -5 porque estamos en QIII.",
      "tan(t) = y/x = (-12)/(-5) = 12/5.",
    ],
    formulas: ["tan(t) = sen(t) / cos(t)", "x² + y² = r²"],
    proMax: {
      why: "Te dan cuadrante y seno; falta deducir coseno.",
      commonMistake: "Elegir x = +5 aunque QIII exige x negativo.",
      testTip: "Antes de calcular, decide el signo del cuadrante.",
      workedExample: "En QII con cos = -3/5, sen = +4/5.",
    },
    graph: { type: "trig", amplitude: 1, k: 1, b: 0, c: 0 },
  },
  {
    id: "diag-seno-coseno",
    module: "I3",
    topic: "seno-coseno",
    topicLabel: "Seno y coseno",
    difficulty: "Base",
    prompt: "En el círculo unitario, ¿qué representa cos(t)?",
    choices: ["La coordenada x", "La coordenada y", "El radio al cuadrado", "La pendiente siempre"],
    answerIndex: 0,
    explanation: "En el círculo unitario, cos(t) es la coordenada x y sen(t) es la coordenada y.",
    steps: [
      "Un punto del círculo unitario se escribe (cos(t), sen(t)).",
      "La primera coordenada es x.",
      "Por eso cos(t) = x.",
      "Respuesta: la coordenada x.",
    ],
    formulas: ["P(t) = (cos(t), sen(t))"],
    proMax: {
      why: "Es lectura directa del círculo unitario.",
      commonMistake: "Intercambiar seno y coseno.",
      testTip: "Orden útil: coseno va primero como x.",
      workedExample: "En t = 0, P = (1,0), cos(0) = 1.",
    },
    graph: { type: "trig", amplitude: 1, k: 1, b: 0, c: 0 },
  },
  {
    id: "diag-amplitud",
    module: "I3",
    topic: "amplitud",
    topicLabel: "Amplitud",
    difficulty: "Base",
    prompt: "Para y = -4 cos(x), ¿cuál es la amplitud?",
    choices: ["-4", "4", "π", "2π"],
    answerIndex: 1,
    explanation: "La amplitud es |A|. Si A = -4, amplitud = 4.",
    steps: [
      "Identificamos A = -4.",
      "La amplitud es el valor absoluto de A.",
      "|-4| = 4.",
      "Respuesta: 4.",
    ],
    formulas: ["Amplitud = |A| en y = A·sen(k(x-b)) + c"],
    proMax: {
      why: "El coeficiente externo estira verticalmente.",
      commonMistake: "Decir amplitud -4. La amplitud no es negativa.",
      testTip: "Si A tiene signo negativo, refleja, pero la amplitud queda positiva.",
      workedExample: "y = 3sen(x) tiene amplitud 3.",
    },
    graph: { type: "trig", amplitude: -4, k: 1, b: 0, c: 0 },
  },
  {
    id: "diag-periodo",
    module: "I3",
    topic: "periodo",
    topicLabel: "Período",
    difficulty: "Media",
    prompt: "Para y = 3 sen(2x), ¿cuál es el período?",
    choices: ["2π", "π", "3π", "2"],
    answerIndex: 1,
    explanation: "El período es 2π/|k|. Aquí k = 2, entonces período = π.",
    steps: [
      "Identificamos k = 2.",
      "Usamos período = 2π/|k|.",
      "Período = 2π/2 = π.",
      "Respuesta: π.",
    ],
    formulas: ["Período = 2π/|k|"],
    proMax: {
      why: "k multiplica a x y comprime horizontalmente.",
      commonMistake: "Responder k = 2 como si fuera período.",
      testTip: "k grande significa onda más apretada.",
      workedExample: "y = sen(4x) tiene período π/2.",
    },
    graph: { type: "trig", amplitude: 3, k: 2, b: 0, c: 0 },
  },
  {
    id: "diag-desfase",
    module: "I3",
    topic: "desfase",
    topicLabel: "Desfase",
    difficulty: "Media",
    prompt: "En y = sen(x - π/3), ¿cuál es el desfase?",
    choices: ["π/3 a la derecha", "π/3 a la izquierda", "3π a la derecha", "Sin desfase"],
    answerIndex: 0,
    explanation: "La forma x - b desplaza b unidades hacia la derecha. Aquí b = π/3.",
    steps: [
      "Comparamos con y = sen(x - b).",
      "Aquí x - π/3 significa b = π/3.",
      "El signo menos dentro indica desplazamiento a la derecha.",
      "Respuesta: π/3 a la derecha.",
    ],
    formulas: ["y = A·sen(k(x-b)) + c"],
    proMax: {
      why: "El desfase está dentro del paréntesis.",
      commonMistake: "Pensar que el signo menos mueve a la izquierda.",
      testTip: "Dentro de la función el signo se interpreta al revés.",
      workedExample: "sen(x + 2) = sen(x - (-2)) se mueve 2 a la izquierda.",
    },
    graph: { type: "trig", amplitude: 1, k: 1, b: Math.PI / 3, c: 0 },
  },
  {
    id: "diag-modelamiento-lineal",
    module: "Examen",
    topic: "modelamiento",
    topicLabel: "Modelamiento",
    difficulty: "Media",
    prompt: "Un modelo lineal pasa por (0, 5) y (2, 11). ¿Cuál es la pendiente?",
    choices: ["2", "3", "5", "6"],
    answerIndex: 1,
    explanation: "La pendiente es (11 - 5)/(2 - 0) = 6/2 = 3.",
    steps: [
      "Tomamos puntos (0,5) y (2,11).",
      "m = (y2 - y1)/(x2 - x1).",
      "m = (11 - 5)/(2 - 0) = 6/2 = 3.",
      "Respuesta: 3.",
    ],
    formulas: ["m = (y2 - y1)/(x2 - x1)"],
    proMax: {
      why: "Dos puntos de un modelo lineal determinan pendiente.",
      commonMistake: "Usar y/x con un solo punto y olvidar el cambio.",
      testTip: "Pendiente es cambio en y sobre cambio en x.",
      workedExample: "Entre (1,4) y (3,10), m = 6/2 = 3.",
    },
    graph: { type: "line", points: [{ x: 0, y: 5 }, { x: 2, y: 11 }], slope: 3, intercept: 5 },
  },
  {
    id: "diag-lectura-grafica",
    module: "Examen",
    topic: "lectura-grafica",
    topicLabel: "Lectura de gráficos",
    difficulty: "Media",
    prompt: "Si una recta corta el eje y en 4 y tiene pendiente -2, ¿cuál es su ecuación?",
    choices: ["y = 4x - 2", "y = -2x + 4", "y = 2x + 4", "y = -4x + 2"],
    answerIndex: 1,
    explanation: "La forma y = mx + b usa pendiente m = -2 e intercepto b = 4.",
    steps: [
      "La forma pendiente-intercepto es y = mx + b.",
      "La pendiente es m = -2.",
      "El corte con eje y es b = 4.",
      "Respuesta: y = -2x + 4.",
    ],
    formulas: ["y = mx + b"],
    proMax: {
      why: "La pregunta entrega pendiente e intercepto.",
      commonMistake: "Cambiar m con b.",
      testTip: "El corte en y es el número que va solo.",
      workedExample: "m = 5 y b = -1 da y = 5x - 1.",
    },
    graph: { type: "line", points: [{ x: 0, y: 4 }, { x: 2, y: 0 }], slope: -2, intercept: 4 },
  },
]

export const PRECALCULO_PRACTICE_QUESTIONS: PrecalculoLearningQuestion[] = [
  PRECALCULO_DIAGNOSTIC_13[6],
  PRECALCULO_DIAGNOSTIC_13[9],
  PRECALCULO_DIAGNOSTIC_13[10],
  PRECALCULO_DIAGNOSTIC_13[11],
  PRECALCULO_DIAGNOSTIC_13[12],
  PRECALCULO_DIAGNOSTIC_13[1],
]

export function shuffledDiagnosticQuestions() {
  return [...PRECALCULO_DIAGNOSTIC_13].sort(() => Math.random() - 0.5)
}

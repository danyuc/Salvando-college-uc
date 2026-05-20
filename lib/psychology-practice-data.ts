export type PsychologyQuestionType =
  | "multiple_choice"
  | "short_development"
  | "application_case"
  | "integrative_question"

export type PsychologyDifficulty = "low" | "medium" | "high"
export type PsychologyCognitiveSkill =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "compare"
  | "interpret"

export type PsychologyOption = {
  id: "A" | "B" | "C" | "D"
  text: string
}

export type PsychologyQuestion = {
  id: string
  classId: string
  type: PsychologyQuestionType
  difficulty: PsychologyDifficulty
  cognitiveSkill: PsychologyCognitiveSkill
  prompt: string
  options?: PsychologyOption[]
  correctAnswer: string
  explanation: string
  distractorExplanations: Record<string, string>
  expectedAnswer?: string
  gradingCriteria?: string[]
  source: {
    kind: "clase" | "texto" | "cuaderno" | "integracion" | "prueba"
    label: string
  }
  tags: string[]
  relatedConcepts: string[]
  weaknessDetected: string
  studyRecommendation: string
}

export type PsychologyClass = {
  id: string
  title: string
  centralTheme: string
  sources: string[]
  keyConcepts: string[]
  teacherEmphasis: string[]
  examPrediction: string
  commonErrors: string[]
}

type OptionId = PsychologyOption["id"]

type RawQuestion = {
  concept: string
  classId: string
  type: PsychologyQuestionType
  difficulty: PsychologyDifficulty
  cognitiveSkill: PsychologyCognitiveSkill
  prompt: string
  correct: string
  distractors?: [string, string, string]
  distractorReasons?: [string, string, string]
  explanation?: string
  expectedAnswer?: string
  gradingCriteria?: string[]
  tags: string[]
  relatedConcepts?: string[]
  weaknessDetected?: string
  studyRecommendation?: string
  sourceLabel?: string
}

const optionIds: OptionId[] = ["A", "B", "C", "D"]

export const PSYCHOLOGY_SUBJECT = {
  id: "psicologia-procesos-basicos",
  name: "Psicología / Procesos Psicológicos Básicos",
  description:
    "Práctica estudiantil basada en clases, textos, cuaderno y estilo de prueba universitaria.",
  assessmentStyle:
    "Desarrollo, aplicación, comparación conceptual y alternativas con distractores plausibles.",
  examPattern:
    "Patrón detectado: 2 preguntas de estilo desarrollo por clase; se exige explicar, aplicar y conectar conceptos.",
} as const

export const PSYCHOLOGY_CLASSES: PsychologyClass[] = [
  {
    id: "psico-clase-4",
    title: "Memoria",
    sources: [
      "Clase 4 PPT: Memoria, modelo modal, Baddeley, codificación, recuperación, amnesias, memorias múltiples.",
      "Gray 2008 Cap. 9: Memoria y conciencia.",
      "Cuaderno: memoria constructiva, modelo modal, memoria sensorial, memoria de trabajo, memoria de largo plazo, bucle fonológico, agenda visoespacial, ejecutivo central, elaboración, claves contextuales, falsas memorias.",
    ],
    centralTheme:
      "La memoria humana no es una copia exacta: almacena, recupera y reconstruye información.",
    keyConcepts: [
      "memoria sensorial",
      "memoria de trabajo",
      "memoria de largo plazo",
      "modelo modal",
      "atención",
      "codificación",
      "recuperación",
      "bucle fonológico",
      "agenda visoespacial",
      "ejecutivo central",
      "elaboración",
      "organización",
      "segmentación",
      "claves contextuales de recuperación",
      "memoria constructiva",
      "falsas memorias",
      "amnesia retrógrada",
      "amnesia anterógrada",
      "memoria explícita",
      "memoria episódica",
      "memoria semántica",
      "memoria implícita",
      "memoria procedimental",
    ],
    teacherEmphasis: [
      "La memoria cotidiana es constructiva.",
      "Recordar implica reconstruir, no copiar.",
      "El modelo modal sirve como marco, no como verdad literal.",
    ],
    examPrediction:
      "Alta probabilidad de preguntas sobre modelo modal, Baddeley, memoria constructiva y falsas memorias.",
    commonErrors: [
      "Tratar la memoria como una grabación exacta.",
      "Confundir memoria sensorial con memoria de largo plazo.",
      "Usar Baddeley como una lista de nombres sin explicar funciones.",
    ],
  },
  {
    id: "psico-clase-5",
    title: "Aprendizaje",
    sources: [
      "Clase 5 PPT: aprendizaje, Pavlov, Watson, condicionamiento clásico, condicionamiento operante, Skinner, programas de reforzamiento, conducta supersticiosa.",
      "Feldman 2010 Cap. 5: aprendizaje, condicionamiento clásico y operante.",
      "Cuaderno: aprendizaje como cambio relativamente permanente, superstición, Pavlov, Watson.",
    ],
    centralTheme:
      "El aprendizaje es un cambio relativamente permanente en el comportamiento generado por la experiencia.",
    keyConcepts: [
      "aprendizaje",
      "condicionamiento clásico",
      "Pavlov",
      "estímulo incondicionado",
      "respuesta incondicionada",
      "estímulo neutro",
      "estímulo condicionado",
      "respuesta condicionada",
      "extinción",
      "recuperación espontánea",
      "generalización",
      "discriminación",
      "Watson",
      "Little Albert",
      "condicionamiento operante",
      "Skinner",
      "Thorndike",
      "ley del efecto",
      "reforzamiento",
      "refuerzo positivo",
      "refuerzo negativo",
      "castigo positivo",
      "castigo negativo",
      "programa continuo",
      "programa intermitente",
      "razón fija",
      "razón variable",
      "intervalo fijo",
      "intervalo variable",
      "conducta supersticiosa",
      "redes sociales",
    ],
    teacherEmphasis: [
      "Aplicar condicionamiento a fobias, adicciones, redes sociales, apuestas y supersticiones.",
    ],
    examPrediction:
      "Alta probabilidad de preguntas aplicadas sobre EI/RI/EC/RC, refuerzo/castigo y programas de reforzamiento.",
    commonErrors: [
      "Confundir refuerzo negativo con castigo.",
      "Nombrar EI/RI/EC/RC sin explicar la asociación.",
      "Asumir causalidad real en conducta supersticiosa.",
    ],
  },
  {
    id: "psico-clase-6",
    title: "Razonamiento e Inteligencia",
    sources: [
      "Clase 6 PPT: razonamiento inductivo, deductivo, sesgos, insight, inteligencia, Galton, Binet, Wechsler, factor g.",
      "Gray 2008 Cap. 10: razonamiento e inteligencia.",
      "Cuaderno: analogía, sesgos de disponibilidad, confirmación y mundo predecible.",
    ],
    centralTheme:
      "Razonamos usando memoria y experiencia previa para interpretar situaciones, anticipar consecuencias y resolver problemas.",
    keyConcepts: [
      "razonamiento inductivo",
      "razonamiento deductivo",
      "analogía",
      "sesgo de disponibilidad",
      "sesgo de confirmación",
      "sesgo del mundo predecible",
      "insight",
      "experiencia ahá",
      "problema de la vela",
      "fijación funcional",
      "disposición mental",
      "inteligencia",
      "Galton",
      "Binet",
      "Wechsler",
      "cociente intelectual",
      "factor g",
      "Spearman",
      "inteligencia fluida",
      "inteligencia cristalizada",
      "Cattell",
    ],
    teacherEmphasis: [
      "Diferenciar validez lógica de verdad factual.",
      "Identificar sesgos en situaciones reales.",
      "La inteligencia sirve para adaptarse a entornos nuevos y cambiantes.",
    ],
    examPrediction:
      "Alta probabilidad de inducción/deducción, sesgos, insight, inteligencia fluida/cristalizada.",
    commonErrors: [
      "Confundir verdad factual con validez lógica.",
      "Nombrar sesgos sin aplicarlos al caso.",
      "Reducir inteligencia a una sola prueba sin matices.",
    ],
  },
  {
    id: "psico-clase-7",
    title: "Lenguaje",
    sources: [
      "Clase 7 PPT: lenguaje como comunicación, pensamiento, cultura, representación y creación; Sapir-Whorf; Aymara; bases neurales.",
      "Feldman 2010 Cap. 7 Módulo 22: lenguaje, gramática, desarrollo, teorías de adquisición, relatividad lingüística.",
      "Cuaderno: lenguaje como medio para comunicar y pensar, inserción cultural, lenguaje refleja y crea realidad.",
    ],
    centralTheme:
      "El lenguaje no solo comunica: también participa en el pensamiento, la cultura y la experiencia psicológica.",
    keyConcepts: [
      "lenguaje",
      "comunicación simbólica",
      "gramática",
      "fonología",
      "fonema",
      "sintaxis",
      "semántica",
      "balbuceo",
      "habla telegráfica",
      "sobregeneralización",
      "teoría del aprendizaje del lenguaje",
      "innatismo",
      "Chomsky",
      "gramática universal",
      "dispositivo de adquisición del lenguaje",
      "enfoque interaccionista",
      "área de Broca",
      "área de Wernicke",
      "fascículo arqueado",
      "relatividad lingüística",
      "hipótesis fuerte",
      "hipótesis débil",
      "Sapir-Whorf",
      "Aymara: pasado/futuro",
    ],
    teacherEmphasis: [
      "No reducir lenguaje a sistema formal.",
      "Lenguaje como uso, cultura, expresión y creación social.",
    ],
    examPrediction:
      "Alta probabilidad de Sapir-Whorf, fonología/sintaxis/semántica, adquisición del lenguaje y comparación de teorías.",
    commonErrors: [
      "Confundir hipótesis fuerte con hipótesis débil.",
      "Reducir lenguaje solo a gramática formal.",
      "Comparar teorías de adquisición sin explicar diferencias.",
    ],
  },
]

function sourceFor(classId: string, custom?: string) {
  if (custom) return custom
  if (classId === "psico-clase-4") return "Clase 4 PPT + Gray Cap. 9 + cuaderno"
  if (classId === "psico-clase-5") return "Clase 5 PPT + Feldman Cap. 5 + cuaderno"
  if (classId === "psico-clase-6") return "Clase 6 PPT + Gray Cap. 10 + cuaderno"
  return "Clase 7 PPT + Feldman Módulo 22 + cuaderno"
}

function buildQuestion(raw: RawQuestion, index: number): PsychologyQuestion {
  const id = `psi-${raw.classId.replace("psico-clase-", "c")}-${String(index + 1).padStart(3, "0")}`
  const relatedConcepts = raw.relatedConcepts ?? raw.tags
  const explanation =
    raw.explanation ??
    `La respuesta correcta es la opción que aplica ${raw.concept} según los materiales de la clase, el texto y el cuaderno.`
  const weaknessDetected =
    raw.weaknessDetected ?? `Dificultad para distinguir o aplicar ${raw.concept} en situaciones concretas.`
  const studyRecommendation =
    raw.studyRecommendation ??
    `Repasa ${raw.concept}, escribe una definición propia y aplícala a un ejemplo cotidiano antes de volver a responder.`

  if (raw.type === "multiple_choice" || raw.type === "application_case") {
    const distractors = raw.distractors ?? [
      `Confundir ${raw.concept} con un concepto cercano.`,
      "Responder desde sentido común sin usar el material del curso.",
      "Elegir una definición parcial que no explica el caso.",
    ]
    const reasons = raw.distractorReasons ?? [
      "Este distractor captura una confusión conceptual frecuente.",
      "Esta opción parece plausible, pero no usa el criterio psicológico correcto.",
      "La idea es incompleta o pertenece a otra clase.",
    ]
    const correctSlot = index % 4
    const optionTexts = [...distractors]
    optionTexts.splice(correctSlot, 0, raw.correct)
    const options = optionTexts.map((text, optionIndex) => ({
      id: optionIds[optionIndex],
      text,
    }))
    const distractorExplanations = Object.fromEntries(
      options
        .filter((option) => option.id !== optionIds[correctSlot])
        .map((option, reasonIndex) => [option.id, reasons[reasonIndex] ?? "No responde al foco conceptual del enunciado."])
    )

    return {
      id,
      classId: raw.classId,
      type: raw.type,
      difficulty: raw.difficulty,
      cognitiveSkill: raw.cognitiveSkill,
      prompt: raw.prompt,
      options,
      correctAnswer: optionIds[correctSlot],
      explanation,
      distractorExplanations,
      source: { kind: "integracion", label: sourceFor(raw.classId, raw.sourceLabel) },
      tags: raw.tags,
      relatedConcepts,
      weaknessDetected,
      studyRecommendation,
    }
  }

  return {
    id,
    classId: raw.classId,
    type: raw.type,
    difficulty: raw.difficulty,
    cognitiveSkill: raw.cognitiveSkill,
    prompt: raw.prompt,
    correctAnswer: raw.correct,
    explanation,
    distractorExplanations: {},
    expectedAnswer: raw.expectedAnswer ?? raw.correct,
    gradingCriteria: raw.gradingCriteria ?? [
      `Define correctamente ${raw.concept}.`,
      "Aplica el concepto a la situación planteada.",
      "Usa vocabulario del material de clase.",
      "Evita una respuesta memorística o circular.",
    ],
    source: { kind: "integracion", label: sourceFor(raw.classId, raw.sourceLabel) },
    tags: raw.tags,
    relatedConcepts,
    weaknessDetected,
    studyRecommendation,
  }
}

const memoryQuestions: RawQuestion[] = [
  {
    classId: "psico-clase-4",
    concept: "modelo modal de memoria",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "Según el modelo modal, ¿qué secuencia representa mejor el flujo básico de la información?",
    correct: "Memoria sensorial, selección atencional, memoria de trabajo y memoria de largo plazo.",
    distractors: [
      "Memoria semántica, memoria episódica, fonología y sintaxis.",
      "Refuerzo, castigo, extinción y recuperación espontánea.",
      "Insight, fijación funcional, factor g e inteligencia cristalizada.",
    ],
    explanation: "El modelo modal organiza la memoria como un marco de entrada sensorial, atención, procesamiento activo y almacenamiento de largo plazo.",
    tags: ["modelo modal", "memoria sensorial", "memoria de trabajo", "memoria de largo plazo"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria sensorial",
    type: "application_case",
    difficulty: "low",
    cognitiveSkill: "apply",
    prompt: "Una estudiante alcanza a percibir una palabra proyectada por un instante, aunque no logra repetirla después. ¿Qué sistema explica mejor esa huella brevísima?",
    correct: "Memoria sensorial.",
    distractors: ["Memoria semántica.", "Memoria procedimental.", "Amnesia retrógrada."],
    explanation: "La memoria sensorial mantiene brevemente entradas perceptivas antes de que la atención seleccione parte de esa información.",
    tags: ["memoria sensorial", "atención", "modelo modal"],
  },
  {
    classId: "psico-clase-4",
    concept: "atención",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "analyze",
    prompt: "Explique el papel de la atención en el paso desde memoria sensorial hacia memoria de trabajo.",
    correct: "La atención selecciona parte de la información sensorial disponible y permite que esa información sea mantenida y manipulada en memoria de trabajo; sin selección atencional, gran parte de la entrada sensorial se pierde rápidamente.",
    tags: ["atención", "memoria sensorial", "memoria de trabajo"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria de trabajo",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué distingue mejor a la memoria de trabajo respecto de un simple almacén pasivo?",
    correct: "Mantiene y manipula información de manera activa durante tareas cognitivas.",
    distractors: [
      "Guarda recuerdos autobiográficos por años.",
      "Opera solo fuera de la conciencia.",
      "Conserva estímulos visuales sin atención.",
    ],
    explanation: "La memoria de trabajo no solo retiene: también opera sobre la información para comprender, razonar o resolver problemas.",
    tags: ["memoria de trabajo", "Baddeley", "procesamiento activo"],
  },
  {
    classId: "psico-clase-4",
    concept: "bucle fonológico",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una persona repite mentalmente un número de teléfono para no olvidarlo antes de anotarlo. ¿Qué componente de Baddeley está usando principalmente?",
    correct: "Bucle fonológico.",
    distractors: ["Agenda visoespacial.", "Memoria episódica.", "Factor g."],
    explanation: "El bucle fonológico mantiene material verbal mediante repetición subvocal.",
    tags: ["Baddeley", "bucle fonológico", "memoria de trabajo"],
  },
  {
    classId: "psico-clase-4",
    concept: "agenda visoespacial",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Al imaginar la distribución de una sala para ubicar dónde estaba una mochila, ¿qué componente de la memoria de trabajo se activa principalmente?",
    correct: "Agenda visoespacial.",
    distractors: ["Bucle fonológico.", "Memoria semántica.", "Respuesta condicionada."],
    explanation: "La agenda visoespacial trabaja con imágenes mentales, posiciones y relaciones espaciales.",
    tags: ["Baddeley", "agenda visoespacial", "memoria de trabajo"],
  },
  {
    classId: "psico-clase-4",
    concept: "ejecutivo central",
    type: "multiple_choice",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "¿Cuál descripción corresponde mejor al ejecutivo central en el modelo de Baddeley?",
    correct: "Coordina la atención y distribuye recursos entre tareas de la memoria de trabajo.",
    distractors: [
      "Almacena sonidos por años.",
      "Registra únicamente coordenadas espaciales.",
      "Convierte todo recuerdo episódico en semántico.",
    ],
    explanation: "El ejecutivo central organiza el control atencional y la coordinación entre subsistemas.",
    tags: ["Baddeley", "ejecutivo central", "atención"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria de largo plazo",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "¿Qué característica se asocia más directamente con la memoria de largo plazo?",
    correct: "Almacenamiento relativamente duradero de conocimientos, experiencias y habilidades.",
    distractors: [
      "Retención visual inferior a un segundo.",
      "Conteo inmediato de alternativas A/B/C/D.",
      "Refuerzo de una conducta por retirar un estímulo molesto.",
    ],
    explanation: "La memoria de largo plazo incluye conocimientos, episodios, habilidades y otros aprendizajes relativamente duraderos.",
    tags: ["memoria de largo plazo", "memoria explícita", "memoria implícita"],
  },
  {
    classId: "psico-clase-4",
    concept: "codificación",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "Explique por qué la codificación es clave para recordar después una materia de prueba.",
    correct: "La codificación transforma o procesa la información para que pueda ser almacenada de manera útil. Si el estudio se limita a repetir sin elaborar, la recuperación posterior suele ser más débil que cuando se organizan relaciones, ejemplos y significado.",
    tags: ["codificación", "elaboración", "recuperación"],
  },
  {
    classId: "psico-clase-4",
    concept: "recuperación",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "interpret",
    prompt: "Un estudiante sabe que estudió un concepto, pero solo lo recuerda cuando ve una pista parecida al ejemplo de clase. ¿Qué proceso explica esa mejora?",
    correct: "Recuperación apoyada por claves contextuales.",
    distractors: ["Castigo negativo.", "Habla telegráfica.", "Fijación funcional."],
    explanation: "Las claves de recuperación ayudan a acceder a información almacenada cuando comparten contexto o asociaciones con la codificación.",
    tags: ["recuperación", "claves contextuales", "codificación"],
  },
  {
    classId: "psico-clase-4",
    concept: "elaboración",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "¿Cuál estrategia representa mejor la elaboración al estudiar memoria?",
    correct: "Relacionar el concepto con ejemplos propios, comparaciones y significado.",
    distractors: [
      "Copiar una palabra diez veces sin explicar su sentido.",
      "Mirar una diapositiva durante milisegundos.",
      "Evitar toda asociación previa para no contaminar el recuerdo.",
    ],
    explanation: "La elaboración fortalece la codificación al conectar la información nueva con conocimiento previo y significado.",
    tags: ["elaboración", "codificación", "estrategias de estudio"],
  },
  {
    classId: "psico-clase-4",
    concept: "organización",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una estudiante agrupa memoria explícita, implícita, episódica y semántica en un mapa conceptual. ¿Qué estrategia usa?",
    correct: "Organización de la información.",
    distractors: ["Recuperación espontánea.", "Refuerzo negativo.", "Sobregeneralización lingüística."],
    explanation: "Organizar permite estructurar relaciones entre conceptos y facilita la recuperación posterior.",
    tags: ["organización", "memoria explícita", "memoria semántica"],
  },
  {
    classId: "psico-clase-4",
    concept: "chunking o segmentación",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Por qué segmentar una lista larga en grupos ayuda a la memoria de trabajo?",
    correct: "Porque reduce la carga al tratar varias unidades como bloques con sentido.",
    distractors: [
      "Porque elimina la necesidad de atención.",
      "Porque transforma todo aprendizaje en memoria implícita.",
      "Porque impide cualquier falsa memoria.",
    ],
    explanation: "La segmentación organiza unidades pequeñas en bloques significativos, haciendo más manejable la información activa.",
    tags: ["segmentación", "chunking", "memoria de trabajo"],
  },
  {
    classId: "psico-clase-4",
    concept: "claves contextuales",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "interpret",
    prompt: "Una persona recuerda mejor una conversación al volver al mismo lugar donde ocurrió. ¿Qué concepto se ilustra?",
    correct: "Claves contextuales de recuperación.",
    distractors: ["Ley del efecto.", "Área de Broca.", "Razonamiento deductivo."],
    explanation: "El contexto puede funcionar como pista para recuperar información asociada durante la codificación.",
    tags: ["claves contextuales", "recuperación", "contexto"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria constructiva",
    type: "short_development",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique por qué decir que la memoria es constructiva cambia la forma de interpretar un testimonio.",
    correct: "Implica entender que recordar no es reproducir una grabación, sino reconstruir a partir de esquemas, contexto, expectativas y fragmentos almacenados. Por eso un testimonio puede sentirse seguro y aun así incluir distorsiones.",
    tags: ["memoria constructiva", "testimonio", "recuperación"],
  },
  {
    classId: "psico-clase-4",
    concept: "falsas memorias",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Después de escuchar repetidamente una historia familiar, alguien cree recordar detalles que nunca vivió. ¿Qué explicación es más consistente con el curso?",
    correct: "Puede tratarse de una falsa memoria producida por reconstrucción, sugestión y asociaciones previas.",
    distractors: [
      "Es necesariamente memoria sensorial.",
      "Demuestra que la memoria siempre copia exactamente los hechos.",
      "Corresponde a refuerzo de razón variable.",
    ],
    explanation: "Las falsas memorias muestran que la recuperación puede incorporar información sugerida o imaginada.",
    tags: ["falsas memorias", "memoria constructiva", "sugestión"],
  },
  {
    classId: "psico-clase-4",
    concept: "amnesia retrógrada",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué describe mejor la amnesia retrógrada?",
    correct: "Dificultad para recuperar recuerdos formados antes del daño o evento.",
    distractors: [
      "Incapacidad para formar nuevos recuerdos después del evento.",
      "Pérdida exclusiva del bucle fonológico.",
      "Aumento de respuesta por retirar un estímulo desagradable.",
    ],
    explanation: "La amnesia retrógrada afecta recuerdos previos; se distingue de la anterógrada.",
    tags: ["amnesia retrógrada", "memoria de largo plazo", "recuperación"],
  },
  {
    classId: "psico-clase-4",
    concept: "amnesia anterógrada",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "compare",
    prompt: "¿Qué diferencia principal separa la amnesia anterógrada de la retrógrada?",
    correct: "La anterógrada dificulta formar nuevos recuerdos después del daño; la retrógrada afecta recuerdos previos.",
    distractors: [
      "La anterógrada solo afecta fonemas y la retrógrada solo sintaxis.",
      "Ambas son programas de reforzamiento intermitente.",
      "La retrógrada siempre mejora la memoria explícita.",
    ],
    explanation: "La clave comparativa es la dirección temporal del problema de memoria.",
    tags: ["amnesia anterógrada", "amnesia retrógrada", "comparación conceptual"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria explícita",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "¿Cuál ejemplo corresponde mejor a memoria explícita?",
    correct: "Recordar conscientemente qué se estudió en una clase de memoria.",
    distractors: [
      "Andar en bicicleta sin describir cada movimiento.",
      "Parpadear ante un ruido fuerte.",
      "Aumentar una conducta por refuerzo.",
    ],
    explanation: "La memoria explícita implica acceso consciente a hechos o episodios.",
    tags: ["memoria explícita", "conciencia", "memoria semántica"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria episódica",
    type: "application_case",
    difficulty: "low",
    cognitiveSkill: "apply",
    prompt: "Recordar el momento exacto en que se recibió una nota importante en la universidad corresponde principalmente a:",
    correct: "Memoria episódica.",
    distractors: ["Memoria semántica.", "Memoria sensorial.", "Intervalo variable."],
    explanation: "La memoria episódica se vincula a experiencias personales situadas en tiempo y contexto.",
    tags: ["memoria episódica", "memoria explícita", "experiencia personal"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria semántica",
    type: "application_case",
    difficulty: "low",
    cognitiveSkill: "apply",
    prompt: "Saber que Baddeley propuso componentes de la memoria de trabajo, aunque no se recuerde dónde se aprendió, corresponde a:",
    correct: "Memoria semántica.",
    distractors: ["Memoria episódica.", "Memoria sensorial.", "Respuesta condicionada."],
    explanation: "La memoria semántica guarda conocimiento general y conceptual.",
    tags: ["memoria semántica", "memoria explícita", "conocimiento"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria implícita",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué rasgo caracteriza mejor a la memoria implícita?",
    correct: "Influye en la conducta sin requerir recuperación consciente del contenido.",
    distractors: [
      "Solo almacena nombres de autores.",
      "Es idéntica a la memoria sensorial.",
      "Es siempre una falsa memoria.",
    ],
    explanation: "La memoria implícita se expresa en desempeño, hábitos o procedimientos sin recuerdo deliberado.",
    tags: ["memoria implícita", "memoria procedimental", "conciencia"],
  },
  {
    classId: "psico-clase-4",
    concept: "memoria procedimental",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una persona toca una secuencia en piano sin poder explicar verbalmente cada movimiento. ¿Qué tipo de memoria se expresa?",
    correct: "Memoria procedimental o implícita.",
    distractors: ["Memoria sensorial icónica.", "Memoria semántica verbal.", "Amnesia retrógrada."],
    explanation: "Las habilidades automatizadas se asocian a memoria procedimental, una forma de memoria implícita.",
    tags: ["memoria procedimental", "memoria implícita", "habilidades"],
  },
  {
    classId: "psico-clase-4",
    concept: "integración modelo modal y Baddeley",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "compare",
    prompt: "Compare el modelo modal con el modelo de Baddeley sin tratarlos como explicaciones idénticas.",
    correct: "El modelo modal sirve como marco general del flujo entre memoria sensorial, memoria de trabajo y memoria de largo plazo. Baddeley profundiza la memoria de trabajo al distinguir componentes como bucle fonológico, agenda visoespacial y ejecutivo central. No son idénticos: uno organiza etapas generales y el otro especifica funciones internas de la memoria de trabajo.",
    tags: ["modelo modal", "Baddeley", "memoria de trabajo"],
  },
  {
    classId: "psico-clase-4",
    concept: "recuperación y falsas memorias",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique cómo recuperación, claves contextuales y memoria constructiva pueden combinarse para producir un recuerdo inexacto.",
    correct: "Las claves contextuales pueden facilitar la recuperación, pero lo recuperado se reconstruye desde fragmentos, asociaciones y esquemas previos. Si durante esa reconstrucción se incorporan sugestiones o inferencias, la persona puede producir un recuerdo inexacto o una falsa memoria.",
    tags: ["recuperación", "claves contextuales", "memoria constructiva", "falsas memorias"],
  },
]

const learningQuestions: RawQuestion[] = [
  {
    classId: "psico-clase-5",
    concept: "definición de aprendizaje",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "¿Qué definición se ajusta mejor al concepto de aprendizaje trabajado en clase?",
    correct: "Cambio relativamente permanente en el comportamiento generado por la experiencia.",
    distractors: [
      "Cualquier cambio momentáneo producido solo por fatiga.",
      "Una respuesta automática sin relación con la experiencia.",
      "La recuperación de un recuerdo autobiográfico.",
    ],
    explanation: "El aprendizaje se entiende como cambio relativamente permanente asociado a experiencia, no como fluctuación pasajera.",
    tags: ["aprendizaje", "experiencia", "cambio relativamente permanente"],
  },
  {
    classId: "psico-clase-5",
    concept: "condicionamiento clásico",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué caracteriza al condicionamiento clásico?",
    correct: "La asociación entre estímulos, de modo que un estímulo antes neutro llega a provocar una respuesta.",
    distractors: [
      "La conducta aumenta solo por sus consecuencias posteriores.",
      "La solución aparece por reorganización súbita del problema.",
      "El lenguaje determina completamente el pensamiento.",
    ],
    explanation: "El condicionamiento clásico se centra en asociaciones entre estímulos y respuestas aprendidas.",
    tags: ["condicionamiento clásico", "asociación", "estímulo condicionado"],
  },
  {
    classId: "psico-clase-5",
    concept: "Pavlov",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "En el experimento de Pavlov, el sonido llega a producir salivación después de asociarse con comida. ¿Qué rol cumple el sonido después del aprendizaje?",
    correct: "Estímulo condicionado.",
    distractors: ["Estímulo incondicionado.", "Respuesta incondicionada.", "Castigo negativo."],
    explanation: "El sonido era neutro, pero tras la asociación con comida se transforma en estímulo condicionado.",
    tags: ["Pavlov", "estímulo condicionado", "condicionamiento clásico"],
  },
  {
    classId: "psico-clase-5",
    concept: "estímulo incondicionado",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "En condicionamiento clásico, ¿qué es un estímulo incondicionado?",
    correct: "Un estímulo que provoca una respuesta sin aprendizaje previo.",
    distractors: [
      "Un estímulo que solo aparece después de la extinción.",
      "Una consecuencia que aumenta una conducta.",
      "Una regla gramatical universal.",
    ],
    explanation: "El estímulo incondicionado produce una respuesta de manera no aprendida.",
    tags: ["estímulo incondicionado", "respuesta incondicionada", "Pavlov"],
  },
  {
    classId: "psico-clase-5",
    concept: "respuesta incondicionada",
    type: "application_case",
    difficulty: "low",
    cognitiveSkill: "apply",
    prompt: "Si la comida produce salivación antes de cualquier aprendizaje, ¿qué es la salivación en ese momento?",
    correct: "Respuesta incondicionada.",
    distractors: ["Respuesta condicionada.", "Estímulo condicionado.", "Refuerzo positivo."],
    explanation: "La respuesta incondicionada aparece naturalmente ante el estímulo incondicionado.",
    tags: ["respuesta incondicionada", "Pavlov", "condicionamiento clásico"],
  },
  {
    classId: "psico-clase-5",
    concept: "estímulo neutro",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "Antes de asociarse con comida en Pavlov, el sonido era principalmente:",
    correct: "Un estímulo neutro.",
    distractors: ["Un castigo positivo.", "Una respuesta condicionada.", "Una memoria semántica."],
    explanation: "Un estímulo neutro no produce originalmente la respuesta relevante, pero puede adquirirla por asociación.",
    tags: ["estímulo neutro", "Pavlov", "asociación"],
  },
  {
    classId: "psico-clase-5",
    concept: "respuesta condicionada",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Después del aprendizaje, un sonido provoca salivación aunque no haya comida. ¿Qué es esa salivación ante el sonido?",
    correct: "Respuesta condicionada.",
    distractors: ["Estímulo incondicionado.", "Respuesta incondicionada ante comida.", "Programa de razón fija."],
    explanation: "La respuesta condicionada es la respuesta aprendida ante el estímulo condicionado.",
    tags: ["respuesta condicionada", "estímulo condicionado", "Pavlov"],
  },
  {
    classId: "psico-clase-5",
    concept: "extinción",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "interpret",
    prompt: "Si el estímulo condicionado se presenta repetidamente sin el estímulo incondicionado y la respuesta disminuye, hablamos de:",
    correct: "Extinción.",
    distractors: ["Generalización.", "Refuerzo positivo.", "Fijación funcional."],
    explanation: "La extinción ocurre cuando la asociación deja de sostenerse por ausencia del estímulo incondicionado.",
    tags: ["extinción", "condicionamiento clásico", "asociación"],
  },
  {
    classId: "psico-clase-5",
    concept: "recuperación espontánea",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "interpret",
    prompt: "Una respuesta condicionada parecía extinguida, pero reaparece débilmente después de un descanso. ¿Qué fenómeno ilustra?",
    correct: "Recuperación espontánea.",
    distractors: ["Discriminación.", "Castigo negativo.", "Habla telegráfica."],
    explanation: "La recuperación espontánea muestra que una respuesta extinguida puede reaparecer tras un intervalo.",
    tags: ["recuperación espontánea", "extinción", "condicionamiento clásico"],
  },
  {
    classId: "psico-clase-5",
    concept: "generalización",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Un niño condicionado a temer una rata blanca empieza a temer otros objetos peludos similares. ¿Qué proceso aparece?",
    correct: "Generalización del estímulo.",
    distractors: ["Discriminación precisa.", "Refuerzo negativo.", "Memoria episódica."],
    explanation: "La generalización ocurre cuando respuestas aprendidas se extienden a estímulos parecidos.",
    tags: ["generalización", "Little Albert", "Watson"],
  },
  {
    classId: "psico-clase-5",
    concept: "discriminación",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una persona aprende a responder solo a un tono específico y no a tonos parecidos. ¿Qué proceso describe mejor el caso?",
    correct: "Discriminación del estímulo.",
    distractors: ["Generalización.", "Conducta supersticiosa.", "Sesgo de confirmación."],
    explanation: "La discriminación implica diferenciar estímulos y responder selectivamente.",
    tags: ["discriminación", "condicionamiento clásico", "estímulos"],
  },
  {
    classId: "psico-clase-5",
    concept: "Watson y Little Albert",
    type: "short_development",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique el caso Little Albert identificando estímulo incondicionado, respuesta incondicionada, estímulo condicionado y respuesta condicionada.",
    correct: "El ruido fuerte funcionó como estímulo incondicionado y provocó miedo como respuesta incondicionada. La rata blanca era inicialmente neutra, pero al asociarse con el ruido se volvió estímulo condicionado. El miedo ante la rata pasó a ser respuesta condicionada.",
    tags: ["Watson", "Little Albert", "EI", "RI", "EC", "RC"],
  },
  {
    classId: "psico-clase-5",
    concept: "condicionamiento operante",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué diferencia central separa al condicionamiento operante del clásico?",
    correct: "El operante se centra en consecuencias que aumentan o disminuyen conductas.",
    distractors: [
      "El operante solo trabaja con estímulos neutros previos.",
      "El operante explica exclusivamente memoria sensorial.",
      "El operante niega el papel de la experiencia.",
    ],
    explanation: "En el condicionamiento operante, las consecuencias de la conducta son clave.",
    tags: ["condicionamiento operante", "consecuencias", "Skinner"],
  },
  {
    classId: "psico-clase-5",
    concept: "Skinner",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "¿Con qué enfoque se asocia principalmente Skinner en los materiales revisados?",
    correct: "Condicionamiento operante y análisis de consecuencias.",
    distractors: [
      "Gramática universal y dispositivo de adquisición del lenguaje.",
      "Memoria constructiva y falsas memorias.",
      "Factor g e inteligencia cristalizada.",
    ],
    explanation: "Skinner se asocia al condicionamiento operante, reforzamiento y programas de reforzamiento.",
    tags: ["Skinner", "condicionamiento operante", "reforzamiento"],
  },
  {
    classId: "psico-clase-5",
    concept: "Thorndike y ley del efecto",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué idea resume mejor la ley del efecto de Thorndike?",
    correct: "Las conductas seguidas de consecuencias satisfactorias tienden a repetirse.",
    distractors: [
      "Los fonemas determinan por completo el pensamiento.",
      "Toda memoria se almacena sin reconstrucción.",
      "La validez lógica depende de si la conclusión suena cotidiana.",
    ],
    explanation: "La ley del efecto anticipa la importancia de las consecuencias para fortalecer conductas.",
    tags: ["Thorndike", "ley del efecto", "consecuencias"],
  },
  {
    classId: "psico-clase-5",
    concept: "reforzamiento",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "En condicionamiento operante, reforzamiento significa:",
    correct: "Una consecuencia que aumenta la probabilidad de una conducta.",
    distractors: [
      "Una consecuencia que siempre disminuye una conducta.",
      "Una pista que recupera un recuerdo.",
      "Un error gramatical infantil.",
    ],
    explanation: "El reforzamiento se define por su efecto: aumentar la conducta.",
    tags: ["reforzamiento", "condicionamiento operante", "conducta"],
  },
  {
    classId: "psico-clase-5",
    concept: "refuerzo positivo",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una estudiante participa más porque cada buena intervención recibe reconocimiento público. ¿Qué consecuencia opera?",
    correct: "Refuerzo positivo.",
    distractors: ["Refuerzo negativo.", "Castigo positivo.", "Castigo negativo."],
    explanation: "Es refuerzo positivo porque se agrega algo deseable y aumenta la conducta.",
    tags: ["refuerzo positivo", "condicionamiento operante", "conducta"],
  },
  {
    classId: "psico-clase-5",
    concept: "refuerzo negativo",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una persona se pone cinturón para que deje de sonar la alarma del auto. ¿Qué tipo de consecuencia explica el aumento de la conducta?",
    correct: "Refuerzo negativo.",
    distractors: ["Refuerzo positivo.", "Castigo positivo.", "Castigo negativo."],
    explanation: "La conducta aumenta porque se retira un estímulo desagradable.",
    tags: ["refuerzo negativo", "condicionamiento operante", "consecuencias"],
  },
  {
    classId: "psico-clase-5",
    concept: "castigo positivo",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Si una conducta disminuye porque se agrega una consecuencia desagradable, ¿qué procedimiento se describe?",
    correct: "Castigo positivo.",
    distractors: ["Refuerzo positivo.", "Refuerzo negativo.", "Castigo negativo."],
    explanation: "Castigo positivo agrega algo aversivo para disminuir una conducta.",
    tags: ["castigo positivo", "condicionamiento operante", "castigo"],
  },
  {
    classId: "psico-clase-5",
    concept: "castigo negativo",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Si una conducta disminuye porque se retira un privilegio valorado, ¿qué procedimiento se describe?",
    correct: "Castigo negativo.",
    distractors: ["Refuerzo negativo.", "Castigo positivo.", "Refuerzo positivo."],
    explanation: "Castigo negativo retira algo deseable para disminuir una conducta.",
    tags: ["castigo negativo", "condicionamiento operante", "castigo"],
  },
  {
    classId: "psico-clase-5",
    concept: "programa continuo",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "¿Qué caracteriza a un programa de reforzamiento continuo?",
    correct: "Cada respuesta correcta o conducta objetivo recibe reforzamiento.",
    distractors: [
      "El refuerzo aparece solo después de intervalos impredecibles.",
      "La respuesta se extingue antes de aprenderse.",
      "El refuerzo depende de una analogía.",
    ],
    explanation: "En un programa continuo, cada emisión de la conducta recibe refuerzo.",
    tags: ["programa continuo", "reforzamiento", "Skinner"],
  },
  {
    classId: "psico-clase-5",
    concept: "programa intermitente",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Por qué un programa intermitente suele mantener conductas con fuerza?",
    correct: "Porque el refuerzo aparece algunas veces, haciendo la conducta resistente a la extinción.",
    distractors: [
      "Porque elimina toda expectativa.",
      "Porque solo usa memoria sensorial.",
      "Porque impide aprender por experiencia.",
    ],
    explanation: "La intermitencia puede sostener conductas porque el organismo sigue respondiendo aunque no siempre haya refuerzo.",
    tags: ["programa intermitente", "extinción", "reforzamiento"],
  },
  {
    classId: "psico-clase-5",
    concept: "razón fija",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una aplicación entrega recompensa cada 10 respuestas correctas. ¿Qué programa se parece más a este caso?",
    correct: "Razón fija.",
    distractors: ["Razón variable.", "Intervalo fijo.", "Intervalo variable."],
    explanation: "La razón fija refuerza después de un número constante de respuestas.",
    tags: ["razón fija", "programas de reforzamiento", "respuesta"],
  },
  {
    classId: "psico-clase-5",
    concept: "razón variable",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "apply",
    prompt: "Las apuestas entregan recompensas después de un número impredecible de respuestas. ¿Qué programa describe mejor ese patrón?",
    correct: "Razón variable.",
    distractors: ["Razón fija.", "Intervalo fijo.", "Programa continuo."],
    explanation: "La razón variable refuerza tras una cantidad variable de respuestas y suele ser muy resistente a la extinción.",
    tags: ["razón variable", "apuestas", "programas de reforzamiento"],
  },
  {
    classId: "psico-clase-5",
    concept: "intervalo fijo",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Si una recompensa está disponible cada 30 minutos, siempre que haya conducta, ¿qué programa se aproxima más?",
    correct: "Intervalo fijo.",
    distractors: ["Intervalo variable.", "Razón fija.", "Razón variable."],
    explanation: "En intervalo fijo, el tiempo constante es la clave del refuerzo.",
    tags: ["intervalo fijo", "programas de reforzamiento", "tiempo"],
  },
  {
    classId: "psico-clase-5",
    concept: "intervalo variable",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "apply",
    prompt: "Revisar redes sociales porque las notificaciones aparecen en momentos impredecibles se parece principalmente a:",
    correct: "Intervalo variable.",
    distractors: ["Intervalo fijo.", "Razón fija.", "Programa continuo."],
    explanation: "El refuerzo depende de tiempos variables e impredecibles, lo que puede sostener la revisión frecuente.",
    tags: ["intervalo variable", "redes sociales", "reforzamiento"],
  },
  {
    classId: "psico-clase-5",
    concept: "conducta supersticiosa",
    type: "short_development",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique cómo una conducta supersticiosa puede entenderse desde el condicionamiento operante.",
    correct: "Una conducta supersticiosa puede surgir cuando una acción realizada por azar queda seguida de un resultado reforzante. Aunque no exista relación causal real, el organismo atribuye el resultado a su conducta y aumenta la probabilidad de repetirla.",
    tags: ["conducta supersticiosa", "Skinner", "refuerzo accidental"],
  },
  {
    classId: "psico-clase-5",
    concept: "fobias y condicionamiento clásico",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique cómo el condicionamiento clásico permite analizar la aparición de una fobia sin reducirla a una simple decisión consciente.",
    correct: "Una fobia puede analizarse como asociación entre un estímulo inicialmente neutro y una experiencia aversiva. Luego, el estímulo condicionado provoca una respuesta de miedo, que puede generalizarse a estímulos similares y mantenerse aunque la persona sepa racionalmente que no siempre hay peligro.",
    tags: ["fobias", "condicionamiento clásico", "generalización"],
  },
  {
    classId: "psico-clase-5",
    concept: "adicciones y reforzamiento",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Analice por qué los programas de reforzamiento intermitente ayudan a comprender conductas persistentes como apuestas o uso compulsivo de redes sociales.",
    correct: "La intermitencia hace que la persona siga emitiendo la conducta porque el refuerzo puede aparecer, aunque no aparezca siempre. En razón variable o intervalos variables, la imprevisibilidad fortalece la persistencia y dificulta la extinción.",
    tags: ["programa intermitente", "razón variable", "redes sociales", "apuestas"],
  },
  {
    classId: "psico-clase-5",
    concept: "EI RI EC RC",
    type: "short_development",
    difficulty: "high",
    cognitiveSkill: "compare",
    prompt: "Compare EI, RI, EC y RC usando un ejemplo distinto al de Pavlov.",
    correct: "Debe identificar un estímulo que provoca una respuesta sin aprendizaje previo como EI y esa respuesta como RI. Luego debe mostrar cómo un estímulo neutro se asocia con el EI y se convierte en EC, provocando una RC aprendida.",
    tags: ["EI", "RI", "EC", "RC", "condicionamiento clásico"],
  },
  {
    classId: "psico-clase-5",
    concept: "refuerzo vs castigo",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "compare",
    prompt: "Compare refuerzo y castigo usando el criterio de aumento o disminución de conducta.",
    correct: "El refuerzo aumenta la probabilidad de una conducta; el castigo la disminuye. Positivo significa agregar un estímulo y negativo significa retirar un estímulo, por lo que refuerzo negativo no es castigo.",
    tags: ["refuerzo", "castigo", "positivo", "negativo"],
  },
  {
    classId: "psico-clase-5",
    concept: "discriminación vs generalización",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "compare",
    prompt: "Compare generalización y discriminación en condicionamiento clásico.",
    correct: "La generalización ocurre cuando la respuesta aprendida se extiende a estímulos parecidos; la discriminación ocurre cuando se responde diferencialmente a estímulos específicos y no a otros similares.",
    tags: ["generalización", "discriminación", "condicionamiento clásico"],
  },
  {
    classId: "psico-clase-5",
    concept: "extinción vs recuperación espontánea",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "compare",
    prompt: "Explique la diferencia entre extinción y recuperación espontánea.",
    correct: "La extinción es la disminución de la respuesta condicionada cuando el EC se presenta sin EI. La recuperación espontánea es la reaparición parcial de esa respuesta después de un intervalo.",
    tags: ["extinción", "recuperación espontánea", "condicionamiento clásico"],
  },
  {
    classId: "psico-clase-5",
    concept: "redes sociales y reforzamiento",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "interpret",
    prompt: "Una estudiante revisa constantemente una red social porque a veces hay mensajes o reacciones, pero no sabe cuándo aparecerán. ¿Qué explicación es más precisa?",
    correct: "El patrón se parece a reforzamiento intermitente, especialmente por intervalos variables o recompensas impredecibles.",
    distractors: [
      "Es memoria sensorial porque la pantalla es visual.",
      "Es castigo negativo porque recibe mensajes.",
      "Es insight porque resuelve un problema de forma súbita.",
    ],
    explanation: "La imprevisibilidad del refuerzo ayuda a sostener la conducta de revisión.",
    tags: ["redes sociales", "programa intermitente", "intervalo variable"],
  },
]

const reasoningQuestions: RawQuestion[] = [
  {
    classId: "psico-clase-6",
    concept: "razonamiento inductivo",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Cuál opción describe mejor el razonamiento inductivo?",
    correct: "Inferir un patrón o hipótesis a partir de observaciones o experiencias previas.",
    distractors: [
      "Derivar una conclusión que necesariamente se sigue de premisas verdaderas.",
      "Repetir información verbal para sostenerla unos segundos.",
      "Retirar un estímulo desagradable para aumentar conducta.",
    ],
    explanation: "La inducción parte de casos u observaciones y llega a hipótesis probables, no necesariamente ciertas.",
    tags: ["razonamiento inductivo", "hipótesis", "experiencia previa"],
  },
  {
    classId: "psico-clase-6",
    concept: "razonamiento deductivo",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "compare",
    prompt: "¿Qué rasgo define mejor una deducción válida?",
    correct: "Si las premisas fueran verdaderas, la conclusión tendría que seguirse lógicamente.",
    distractors: [
      "La conclusión debe sonar cotidiana para ser válida.",
      "La conclusión se basa solo en recuerdos disponibles.",
      "La respuesta surge por refuerzo variable.",
    ],
    explanation: "La validez deductiva depende de la relación lógica, no de lo familiar o extraño del contenido.",
    tags: ["razonamiento deductivo", "validez lógica", "premisas"],
  },
  {
    classId: "psico-clase-6",
    concept: "analogías",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Una persona resuelve un problema nuevo comparándolo con otro problema de estructura parecida. ¿Qué forma de razonamiento usa?",
    correct: "Razonamiento por analogía.",
    distractors: ["Castigo positivo.", "Bucle fonológico.", "Habla telegráfica."],
    explanation: "La analogía transfiere relaciones de un caso conocido a otro nuevo.",
    tags: ["analogía", "razonamiento", "transferencia"],
  },
  {
    classId: "psico-clase-6",
    concept: "sesgo de disponibilidad",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "interpret",
    prompt: "Alguien estima que un evento es muy frecuente solo porque recuerda un caso reciente y dramático. ¿Qué sesgo aparece?",
    correct: "Sesgo de disponibilidad.",
    distractors: ["Sesgo de confirmación.", "Fijación funcional.", "Gramática universal."],
    explanation: "La disponibilidad ocurre cuando la facilidad para recuperar ejemplos pesa demasiado en el juicio.",
    tags: ["sesgo de disponibilidad", "memoria", "juicio"],
  },
  {
    classId: "psico-clase-6",
    concept: "sesgo de confirmación",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "interpret",
    prompt: "Una persona busca solo datos que apoyan su opinión inicial e ignora evidencia contraria. ¿Qué sesgo se observa?",
    correct: "Sesgo de confirmación.",
    distractors: ["Sesgo de disponibilidad.", "Sobregeneralización.", "Intervalo fijo."],
    explanation: "El sesgo de confirmación favorece información coherente con creencias previas.",
    tags: ["sesgo de confirmación", "razonamiento", "creencias previas"],
  },
  {
    classId: "psico-clase-6",
    concept: "sesgo del mundo predecible",
    type: "multiple_choice",
    difficulty: "high",
    cognitiveSkill: "understand",
    prompt: "¿Qué idea captura mejor el sesgo del mundo predecible trabajado en cuaderno?",
    correct: "Tendencia a creer que los eventos son más ordenados, anticipables o controlables de lo que realmente son.",
    distractors: [
      "Capacidad de repetir sonidos en memoria de trabajo.",
      "Aprendizaje de una fobia por asociación.",
      "Pérdida de recuerdos previos por amnesia retrógrada.",
    ],
    explanation: "Este sesgo lleva a interpretar el mundo como más predecible o controlable que lo justificado por los datos.",
    tags: ["sesgo del mundo predecible", "sesgos", "razonamiento"],
  },
  {
    classId: "psico-clase-6",
    concept: "deducción válida pero extraña",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Si el argumento es: 'Todos los gatos son planetas; Mía es gato; por tanto Mía es planeta', ¿qué evaluación es correcta?",
    correct: "La forma deductiva es válida, aunque las premisas sean factualmente falsas o extrañas.",
    distractors: [
      "Es inválido porque la conclusión suena rara.",
      "Es inductivo porque habla de animales.",
      "Es un ejemplo de refuerzo positivo.",
    ],
    explanation: "La validez lógica no equivale a verdad factual; evalúa si la conclusión se sigue de las premisas.",
    tags: ["deducción", "validez lógica", "verdad factual"],
  },
  {
    classId: "psico-clase-6",
    concept: "deducción inválida pero tentadora",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Si 'todos los estudiantes responsables estudian' y 'Camila estudia', concluir que 'Camila es responsable' comete principalmente:",
    correct: "Un error deductivo: la conclusión es tentadora, pero no se sigue necesariamente.",
    distractors: [
      "Una recuperación espontánea.",
      "Una respuesta incondicionada.",
      "Una memoria procedimental.",
    ],
    explanation: "Que una persona estudie no prueba que pertenezca al conjunto de estudiantes responsables; puede haber otras razones.",
    tags: ["deducción", "invalidez", "razonamiento tentador"],
  },
  {
    classId: "psico-clase-6",
    concept: "insight",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué caracteriza una solución por insight?",
    correct: "Reorganización súbita de la representación del problema, vivida como experiencia ahá.",
    distractors: [
      "Repetición subvocal de una lista.",
      "Aumento de conducta por recompensa.",
      "Determinación completa del pensamiento por el lenguaje.",
    ],
    explanation: "El insight implica un cambio de representación que permite ver una solución antes no disponible.",
    tags: ["insight", "experiencia ahá", "resolución de problemas"],
  },
  {
    classId: "psico-clase-6",
    concept: "problema de la vela",
    type: "short_development",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique el problema de la vela como ejemplo de insight y fijación funcional.",
    correct: "El problema exige ver la caja no solo como contenedor, sino como soporte. La dificultad surge por fijación funcional: se atribuye al objeto solo su uso habitual. El insight ocurre cuando se reorganiza la representación y aparece una solución.",
    tags: ["problema de la vela", "insight", "fijación funcional"],
  },
  {
    classId: "psico-clase-6",
    concept: "disposición mental",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué describe mejor la disposición mental en solución de problemas?",
    correct: "Tendencia a abordar un problema desde estrategias previas, aunque no sean adecuadas.",
    distractors: [
      "Capacidad de producir fonemas.",
      "Memoria autobiográfica de largo plazo.",
      "Aparición de una respuesta condicionada.",
    ],
    explanation: "La disposición mental puede ayudar si la estrategia sirve, pero bloquear soluciones nuevas si se aplica rígidamente.",
    tags: ["disposición mental", "solución de problemas", "razonamiento"],
  },
  {
    classId: "psico-clase-6",
    concept: "fijación funcional",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "apply",
    prompt: "Una persona no usa una caja como soporte porque solo la ve como contenedor. ¿Qué obstáculo cognitivo aparece?",
    correct: "Fijación funcional.",
    distractors: ["Sesgo de disponibilidad.", "Razón variable.", "Hipótesis débil."],
    explanation: "La fijación funcional limita ver usos alternativos de un objeto.",
    tags: ["fijación funcional", "problema de la vela", "insight"],
  },
  {
    classId: "psico-clase-6",
    concept: "inteligencia",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "Explique la idea de inteligencia como capacidad de adaptación a entornos nuevos y cambiantes.",
    correct: "La inteligencia no se reduce a memorizar datos: implica resolver problemas, aprender de la experiencia, usar razonamiento y adaptarse a demandas nuevas o cambiantes del entorno.",
    tags: ["inteligencia", "adaptación", "resolución de problemas"],
  },
  {
    classId: "psico-clase-6",
    concept: "Galton, Binet y Wechsler",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "compare",
    prompt: "¿Qué comparación histórica es más consistente con Galton, Binet y Wechsler en el tema inteligencia?",
    correct: "Galton se vincula a diferencias individuales; Binet y Wechsler a tradiciones de evaluación psicométrica de habilidades intelectuales.",
    distractors: [
      "Los tres explican principalmente la adquisición del lenguaje por gramática universal.",
      "Los tres pertenecen al condicionamiento clásico y explican EI, RI, EC y RC.",
      "Los tres demuestran que la memoria cotidiana es una copia exacta.",
    ],
    explanation: "Los tres pertenecen a la historia de la medición y evaluación de la inteligencia, pero no cumplen el mismo rol histórico.",
    tags: ["Galton", "Binet", "Wechsler", "inteligencia", "medición"],
  },
  {
    classId: "psico-clase-6",
    concept: "Binet",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "Binet se relaciona en el material con:",
    correct: "Desarrollo de pruebas orientadas a evaluar habilidades intelectuales.",
    distractors: [
      "Refuerzo de razón variable.",
      "Memoria sensorial icónica.",
      "Área de Wernicke.",
    ],
    explanation: "Binet aparece en la historia de las pruebas de inteligencia.",
    tags: ["Binet", "pruebas de inteligencia", "CI"],
  },
  {
    classId: "psico-clase-6",
    concept: "Wechsler",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "Wechsler se vincula principalmente con:",
    correct: "Escalas de inteligencia y evaluación psicométrica.",
    distractors: [
      "Falsas memorias por sugestión.",
      "Teoría del aprendizaje del lenguaje.",
      "Conducta supersticiosa.",
    ],
    explanation: "Wechsler forma parte de la tradición de medición de inteligencia.",
    tags: ["Wechsler", "inteligencia", "evaluación"],
  },
  {
    classId: "psico-clase-6",
    concept: "cociente intelectual",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué precaución conceptual conviene tener al interpretar el cociente intelectual?",
    correct: "No reducir toda inteligencia a un número sin considerar contexto, habilidades y límites de la medición.",
    distractors: [
      "Asumir que mide memoria sensorial únicamente.",
      "Usarlo como estímulo condicionado.",
      "Confundirlo con habla telegráfica.",
    ],
    explanation: "El CI es una medida útil en ciertos marcos, pero no agota el concepto de inteligencia.",
    tags: ["cociente intelectual", "medición", "inteligencia"],
  },
  {
    classId: "psico-clase-6",
    concept: "Spearman y factor g",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué plantea el factor g asociado a Spearman?",
    correct: "Una capacidad general que contribuye al desempeño en distintas tareas intelectuales.",
    distractors: [
      "Una regla universal de adquisición del lenguaje.",
      "Un programa de reforzamiento por intervalos.",
      "Una forma de memoria episódica.",
    ],
    explanation: "El factor g intenta explicar covariación entre desempeños cognitivos diversos.",
    tags: ["Spearman", "factor g", "inteligencia"],
  },
  {
    classId: "psico-clase-6",
    concept: "Cattell",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "remember",
    prompt: "Cattell se asocia en este contenido con la distinción entre:",
    correct: "Inteligencia fluida e inteligencia cristalizada.",
    distractors: [
      "Seno y coseno.",
      "EI y RI en Pavlov.",
      "Hipótesis fuerte y castigo negativo.",
    ],
    explanation: "Cattell distingue capacidades fluidas y cristalizadas.",
    tags: ["Cattell", "inteligencia fluida", "inteligencia cristalizada"],
  },
  {
    classId: "psico-clase-6",
    concept: "inteligencia fluida",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Resolver un problema novedoso sin depender principalmente de conocimiento escolar previo se asocia más con:",
    correct: "Inteligencia fluida.",
    distractors: ["Inteligencia cristalizada.", "Memoria sensorial.", "Castigo negativo."],
    explanation: "La inteligencia fluida se relaciona con razonamiento flexible ante problemas nuevos.",
    tags: ["inteligencia fluida", "Cattell", "problemas nuevos"],
  },
  {
    classId: "psico-clase-6",
    concept: "inteligencia cristalizada",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Usar vocabulario, conocimientos y aprendizajes acumulados durante años se asocia más con:",
    correct: "Inteligencia cristalizada.",
    distractors: ["Inteligencia fluida.", "Extinción.", "Fijación funcional."],
    explanation: "La inteligencia cristalizada se apoya en conocimientos y habilidades adquiridas.",
    tags: ["inteligencia cristalizada", "Cattell", "conocimiento acumulado"],
  },
  {
    classId: "psico-clase-6",
    concept: "sesgos y memoria",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique cómo la memoria puede alimentar sesgos de razonamiento, usando disponibilidad o confirmación.",
    correct: "La memoria aporta ejemplos, asociaciones y experiencias previas al razonamiento. Si se recuperan con facilidad casos llamativos, puede aparecer disponibilidad; si se recupera o busca información coherente con creencias previas, puede aparecer confirmación.",
    tags: ["memoria", "sesgo de disponibilidad", "sesgo de confirmación"],
  },
  {
    classId: "psico-clase-6",
    concept: "razonamiento e inteligencia",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "compare",
    prompt: "Relacione razonamiento inductivo, deductivo e inteligencia como adaptación a situaciones nuevas.",
    correct: "La inducción permite formular hipótesis desde casos; la deducción permite evaluar conclusiones desde premisas; ambas operaciones pueden apoyar la adaptación inteligente a problemas nuevos o cambiantes.",
    tags: ["razonamiento inductivo", "razonamiento deductivo", "inteligencia"],
  },
]

const languageQuestions: RawQuestion[] = [
  {
    classId: "psico-clase-7",
    concept: "lenguaje como comunicación",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "¿Qué implica entender el lenguaje como comunicación simbólica?",
    correct: "Que permite transmitir significados mediante signos compartidos socialmente.",
    distractors: [
      "Que solo funciona como memoria sensorial.",
      "Que siempre determina por completo el pensamiento.",
      "Que es un programa de razón variable.",
    ],
    explanation: "El lenguaje permite comunicación mediante símbolos compartidos por una comunidad.",
    tags: ["lenguaje", "comunicación simbólica", "significado"],
  },
  {
    classId: "psico-clase-7",
    concept: "lenguaje como herramienta de pensamiento",
    type: "short_development",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "Explique por qué el lenguaje no solo comunica, sino que también participa en el pensamiento.",
    correct: "El lenguaje permite organizar categorías, representar experiencias, formular ideas y compartir marcos culturales. Por eso participa en cómo pensamos y no solo en cómo transmitimos información.",
    tags: ["lenguaje", "pensamiento", "representación"],
  },
  {
    classId: "psico-clase-7",
    concept: "lenguaje como fenómeno cultural",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "interpret",
    prompt: "Una palabra usada por un grupo expresa una forma local de organizar la experiencia social. ¿Qué dimensión del lenguaje se destaca?",
    correct: "Lenguaje como fenómeno cultural.",
    distractors: ["Memoria sensorial.", "Refuerzo negativo.", "Inteligencia fluida."],
    explanation: "El lenguaje se inserta en prácticas culturales y refleja formas de vida compartidas.",
    tags: ["lenguaje", "cultura", "uso social"],
  },
  {
    classId: "psico-clase-7",
    concept: "lenguaje como representación",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "Cuando se dice que el lenguaje representa la realidad, se quiere destacar que:",
    correct: "Permite simbolizar objetos, relaciones, eventos e ideas aunque no estén presentes.",
    distractors: [
      "Solo aumenta conductas por refuerzo.",
      "Impide cualquier pensamiento abstracto.",
      "Funciona únicamente como memoria implícita.",
    ],
    explanation: "La representación permite hablar y pensar sobre entidades ausentes o abstractas.",
    tags: ["lenguaje", "representación", "símbolos"],
  },
  {
    classId: "psico-clase-7",
    concept: "creación de realidad social",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique qué significa que el lenguaje puede reflejar y crear realidad social.",
    correct: "El lenguaje refleja prácticas y categorías culturales, pero también crea formas de relación al nombrar roles, identidades, normas o diferencias. Por eso no es solo un código formal: participa en la vida social.",
    tags: ["lenguaje", "realidad social", "cultura"],
  },
  {
    classId: "psico-clase-7",
    concept: "gramática",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "En el material, gramática refiere principalmente a:",
    correct: "Reglas y estructuras que organizan el lenguaje.",
    distractors: [
      "Una forma de castigo positivo.",
      "Una memoria episódica autobiográfica.",
      "Un sesgo de disponibilidad.",
    ],
    explanation: "La gramática organiza componentes como sonidos, combinaciones y significado.",
    tags: ["gramática", "lenguaje", "estructura"],
  },
  {
    classId: "psico-clase-7",
    concept: "fonología",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "¿Qué estudia principalmente la fonología?",
    correct: "Los sonidos del lenguaje y su organización como fonemas.",
    distractors: [
      "La combinación de palabras en oraciones.",
      "El significado de palabras y frases.",
      "La medición del cociente intelectual.",
    ],
    explanation: "La fonología se relaciona con sonidos y fonemas.",
    tags: ["fonología", "fonema", "gramática"],
  },
  {
    classId: "psico-clase-7",
    concept: "fonema",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "¿Qué es un fonema en el estudio del lenguaje?",
    correct: "Una unidad sonora capaz de diferenciar significado en una lengua.",
    distractors: [
      "Una consecuencia reforzante.",
      "Un recuerdo autobiográfico.",
      "Una conclusión deductiva inválida.",
    ],
    explanation: "Los fonemas son unidades sonoras relevantes dentro de un sistema lingüístico.",
    tags: ["fonema", "fonología", "lenguaje"],
  },
  {
    classId: "psico-clase-7",
    concept: "sintaxis",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "¿Qué define mejor la sintaxis?",
    correct: "Reglas de combinación y orden de palabras en frases u oraciones.",
    distractors: [
      "El significado de una palabra aislada únicamente.",
      "La memoria de habilidades automáticas.",
      "La reaparición de una respuesta extinguida.",
    ],
    explanation: "La sintaxis organiza cómo se combinan palabras.",
    tags: ["sintaxis", "gramática", "lenguaje"],
  },
  {
    classId: "psico-clase-7",
    concept: "semántica",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "understand",
    prompt: "¿Qué componente del lenguaje se relaciona más directamente con el significado?",
    correct: "Semántica.",
    distractors: ["Fonología.", "Razón fija.", "Amnesia anterógrada."],
    explanation: "La semántica se ocupa del significado de palabras, frases y expresiones.",
    tags: ["semántica", "significado", "lenguaje"],
  },
  {
    classId: "psico-clase-7",
    concept: "fonología sintaxis semántica",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "compare",
    prompt: "Si una estudiante distingue sonidos, orden de palabras y significado, está comparando principalmente:",
    correct: "Fonología, sintaxis y semántica.",
    distractors: [
      "EI, RI, EC y RC.",
      "Fluida, cristalizada y factor g.",
      "Memoria sensorial, explícita y procedimental únicamente.",
    ],
    explanation: "Estos son componentes gramaticales diferenciables del lenguaje.",
    tags: ["fonología", "sintaxis", "semántica"],
  },
  {
    classId: "psico-clase-7",
    concept: "balbuceo",
    type: "multiple_choice",
    difficulty: "low",
    cognitiveSkill: "remember",
    prompt: "El balbuceo se ubica principalmente en el estudio de:",
    correct: "Desarrollo temprano del lenguaje.",
    distractors: [
      "Condicionamiento operante adulto.",
      "Sesgo de confirmación.",
      "Amnesia retrógrada.",
    ],
    explanation: "El balbuceo forma parte de hitos tempranos del desarrollo lingüístico.",
    tags: ["balbuceo", "desarrollo del lenguaje", "adquisición"],
  },
  {
    classId: "psico-clase-7",
    concept: "habla telegráfica",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Un niño dice 'mamá agua' para comunicar 'mamá, quiero agua'. ¿Qué fenómeno se ilustra?",
    correct: "Habla telegráfica.",
    distractors: ["Fijación funcional.", "Refuerzo negativo.", "Memoria semántica adulta."],
    explanation: "El habla telegráfica usa emisiones breves con palabras clave y omite elementos gramaticales.",
    tags: ["habla telegráfica", "desarrollo del lenguaje", "adquisición"],
  },
  {
    classId: "psico-clase-7",
    concept: "sobregeneralización",
    type: "application_case",
    difficulty: "medium",
    cognitiveSkill: "apply",
    prompt: "Un niño aplica una regla gramatical regular a un caso que es excepción. ¿Qué fenómeno muestra?",
    correct: "Sobregeneralización.",
    distractors: ["Extinción.", "Sesgo de disponibilidad.", "Castigo positivo."],
    explanation: "La sobregeneralización muestra uso activo de reglas, aunque todavía no se dominen excepciones.",
    tags: ["sobregeneralización", "adquisición del lenguaje", "gramática"],
  },
  {
    classId: "psico-clase-7",
    concept: "teoría del aprendizaje del lenguaje",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué enfatiza la teoría del aprendizaje del lenguaje?",
    correct: "Reforzamiento, modelaje y experiencia con cuidadores.",
    distractors: [
      "Determinación genética total sin ambiente.",
      "Pérdida de memoria por daño cerebral.",
      "Validez deductiva de premisas falsas.",
    ],
    explanation: "La teoría del aprendizaje destaca mecanismos generales de aprendizaje aplicados al lenguaje.",
    tags: ["teoría del aprendizaje", "lenguaje", "reforzamiento"],
  },
  {
    classId: "psico-clase-7",
    concept: "innatismo",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "¿Qué sostiene principalmente el enfoque innatista en adquisición del lenguaje?",
    correct: "Que existen predisposiciones biológicas para adquirir lenguaje.",
    distractors: [
      "Que solo existe aprendizaje por castigo.",
      "Que el lenguaje no tiene estructura.",
      "Que toda memoria es copia exacta.",
    ],
    explanation: "El innatismo propone capacidades biológicas específicas para el lenguaje.",
    tags: ["innatismo", "adquisición del lenguaje", "biología"],
  },
  {
    classId: "psico-clase-7",
    concept: "Chomsky",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "remember",
    prompt: "Chomsky se asocia en el material con:",
    correct: "Gramática universal y dispositivo de adquisición del lenguaje.",
    distractors: [
      "Ley del efecto y reforzamiento.",
      "Problema de la vela.",
      "Falsas memorias.",
    ],
    explanation: "Chomsky representa el enfoque innatista del lenguaje.",
    tags: ["Chomsky", "gramática universal", "dispositivo de adquisición"],
  },
  {
    classId: "psico-clase-7",
    concept: "gramática universal",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "La noción de gramática universal apunta a:",
    correct: "Principios estructurales generales que facilitarían la adquisición del lenguaje.",
    distractors: [
      "Un programa de intervalo variable.",
      "Una memoria episódica autobiográfica.",
      "Una respuesta condicionada ante un ruido.",
    ],
    explanation: "La gramática universal forma parte de la explicación innatista.",
    tags: ["gramática universal", "Chomsky", "innatismo"],
  },
  {
    classId: "psico-clase-7",
    concept: "dispositivo de adquisición del lenguaje",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "El dispositivo de adquisición del lenguaje se propone para explicar:",
    correct: "La capacidad infantil de adquirir lenguaje con rapidez a partir de la exposición.",
    distractors: [
      "La extinción de respuestas condicionadas.",
      "La memoria procedimental motora.",
      "La puntuación exacta en una prueba de CI.",
    ],
    explanation: "La idea apunta a una capacidad biológica que facilita la adquisición lingüística.",
    tags: ["dispositivo de adquisición", "Chomsky", "adquisición"],
  },
  {
    classId: "psico-clase-7",
    concept: "enfoque interaccionista",
    type: "short_development",
    difficulty: "high",
    cognitiveSkill: "compare",
    prompt: "Compare teoría del aprendizaje, innatismo e interaccionismo en adquisición del lenguaje.",
    correct: "La teoría del aprendizaje enfatiza reforzamiento, modelaje y experiencia. El innatismo propone predisposiciones biológicas, gramática universal o dispositivo de adquisición. El interaccionismo combina bases biológicas, exposición ambiental e interacción social.",
    tags: ["teoría del aprendizaje", "innatismo", "interaccionismo"],
  },
  {
    classId: "psico-clase-7",
    concept: "área de Broca",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "remember",
    prompt: "En bases neurales del lenguaje, el área de Broca se asocia principalmente con:",
    correct: "Producción del lenguaje.",
    distractors: [
      "Refuerzo variable.",
      "Memoria sensorial auditiva únicamente.",
      "Falsas memorias por sugestión.",
    ],
    explanation: "Broca se relaciona clásicamente con producción del lenguaje.",
    tags: ["área de Broca", "bases neurales", "producción"],
  },
  {
    classId: "psico-clase-7",
    concept: "área de Wernicke",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "remember",
    prompt: "El área de Wernicke se asocia principalmente con:",
    correct: "Comprensión del lenguaje.",
    distractors: [
      "Razón variable.",
      "Fijación funcional.",
      "Respuesta incondicionada.",
    ],
    explanation: "Wernicke se vincula clásicamente a comprensión lingüística.",
    tags: ["área de Wernicke", "bases neurales", "comprensión"],
  },
  {
    classId: "psico-clase-7",
    concept: "fascículo arqueado",
    type: "multiple_choice",
    difficulty: "medium",
    cognitiveSkill: "understand",
    prompt: "El fascículo arqueado se entiende mejor como:",
    correct: "Vía de conexión relevante entre áreas del lenguaje como Broca y Wernicke.",
    distractors: [
      "Un programa de reforzamiento continuo.",
      "Una forma de memoria implícita.",
      "Una hipótesis deductiva inválida.",
    ],
    explanation: "El fascículo arqueado conecta regiones implicadas en lenguaje.",
    tags: ["fascículo arqueado", "Broca", "Wernicke"],
  },
  {
    classId: "psico-clase-7",
    concept: "relatividad lingüística",
    type: "multiple_choice",
    difficulty: "high",
    cognitiveSkill: "understand",
    prompt: "¿Qué plantea en general la relatividad lingüística?",
    correct: "Que el lenguaje puede relacionarse con formas de experimentar, categorizar o interpretar el mundo.",
    distractors: [
      "Que el refuerzo siempre elimina una conducta.",
      "Que la memoria sensorial dura años.",
      "Que la inteligencia es únicamente memoria verbal.",
    ],
    explanation: "La relatividad lingüística vincula lenguaje, pensamiento y experiencia cultural.",
    tags: ["relatividad lingüística", "Sapir-Whorf", "lenguaje y pensamiento"],
  },
  {
    classId: "psico-clase-7",
    concept: "hipótesis fuerte",
    type: "multiple_choice",
    difficulty: "high",
    cognitiveSkill: "compare",
    prompt: "¿Qué caracteriza a la versión fuerte de Sapir-Whorf?",
    correct: "Plantear que el lenguaje determina completamente el pensamiento.",
    distractors: [
      "Plantear solo influencia parcial del lenguaje.",
      "Explicar conducta por refuerzo negativo.",
      "Distinguir memoria episódica y semántica.",
    ],
    explanation: "La versión fuerte es determinista; por eso debe distinguirse de la débil.",
    tags: ["hipótesis fuerte", "Sapir-Whorf", "determinismo lingüístico"],
  },
  {
    classId: "psico-clase-7",
    concept: "hipótesis débil",
    type: "multiple_choice",
    difficulty: "high",
    cognitiveSkill: "compare",
    prompt: "¿Cuál opción representa mejor la hipótesis débil de Sapir-Whorf?",
    correct: "El lenguaje puede influir en cómo se experimenta y categoriza el mundo.",
    distractors: [
      "El lenguaje determina completamente lo pensable.",
      "El lenguaje no tiene ninguna relación con el pensamiento.",
      "El lenguaje solo existe como sintaxis formal.",
    ],
    explanation: "La versión débil habla de influencia, no de determinación absoluta.",
    tags: ["hipótesis débil", "Sapir-Whorf", "relatividad lingüística"],
  },
  {
    classId: "psico-clase-7",
    concept: "Aymara pasado/futuro",
    type: "application_case",
    difficulty: "high",
    cognitiveSkill: "interpret",
    prompt: "El ejemplo Aymara sobre pasado/futuro se usa mejor para discutir:",
    correct: "Cómo distintas lenguas pueden organizar temporalidad y experiencia de manera diferente.",
    distractors: [
      "Que todas las lenguas organizan el tiempo idénticamente.",
      "Que el lenguaje no tiene dimensión cultural.",
      "Que la memoria sensorial dura más que la semántica.",
    ],
    explanation: "El ejemplo permite analizar relatividad lingüística sin afirmar determinismo absoluto.",
    tags: ["Aymara", "pasado/futuro", "relatividad lingüística"],
  },
  {
    classId: "psico-clase-7",
    concept: "lenguaje y cultura",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Analice por qué la clase advierte no reducir el lenguaje a un sistema formal.",
    correct: "Porque el lenguaje también es uso, cultura, expresión, creación social, representación y pensamiento. Fonología, sintaxis y semántica son importantes, pero no agotan su papel psicológico y cultural.",
    tags: ["lenguaje", "cultura", "gramática", "uso social"],
  },
  {
    classId: "psico-clase-7",
    concept: "lenguaje y razonamiento",
    type: "integrative_question",
    difficulty: "high",
    cognitiveSkill: "analyze",
    prompt: "Explique cómo lenguaje y razonamiento pueden relacionarse sin afirmar que el lenguaje determina por completo el pensamiento.",
    correct: "El lenguaje ofrece categorías, marcos y recursos simbólicos que pueden influir en cómo razonamos e interpretamos situaciones. Sin embargo, la hipótesis débil no afirma determinación total, sino influencia y relación.",
    tags: ["lenguaje", "razonamiento", "hipótesis débil"],
  },
]

const rawQuestions = [
  ...memoryQuestions,
  ...learningQuestions.slice(0, 30),
  ...reasoningQuestions.filter((_, index) => ![14, 15, 22].includes(index)),
  ...languageQuestions.filter((_, index) => ![7, 18, 23, 28].includes(index)),
]

export const PSYCHOLOGY_QUESTIONS: PsychologyQuestion[] = rawQuestions.map(buildQuestion)

export const PSYCHOLOGY_EXPECTED_COUNTS_BY_CLASS = {
  "psico-clase-4": 25,
  "psico-clase-5": 30,
  "psico-clase-6": 20,
  "psico-clase-7": 25,
} as const

function scoreForSeed(question: PsychologyQuestion, seed: number) {
  let score = seed
  for (const char of question.id + question.prompt) {
    score = (score * 31 + char.charCodeAt(0)) % 1000003
  }
  return score
}

function seededQuestions(questions: PsychologyQuestion[], seed = 1) {
  return [...questions].sort((a, b) => scoreForSeed(a, seed) - scoreForSeed(b, seed))
}

function balancedPick(
  questions: PsychologyQuestion[],
  count: number,
  seed: number,
  classIds = PSYCHOLOGY_CLASSES.map((item) => item.id)
) {
  const selected: PsychologyQuestion[] = []
  const pools = classIds.map((classId) => seededQuestions(questions.filter((q) => q.classId === classId), seed))
  let index = 0

  while (selected.length < count && selected.length < questions.length) {
    for (const pool of pools) {
      const next = pool[index]
      if (next && !selected.some((item) => item.id === next.id)) selected.push(next)
      if (selected.length >= count) break
    }
    index += 1
  }

  return selected
}

export function getPsychologyQuestionsByClass(classId: string) {
  return PSYCHOLOGY_QUESTIONS.filter((question) => question.classId === classId)
}

export function getPsychologyDiagnosticQuestions(count = 24, seed = 1) {
  const byDifficulty = ["low", "medium", "high"] as const
  const selected: PsychologyQuestion[] = []

  for (const difficulty of byDifficulty) {
    const candidates = PSYCHOLOGY_QUESTIONS.filter((question) => question.difficulty === difficulty)
    for (const question of balancedPick(candidates, Math.ceil(count / byDifficulty.length), seed + selected.length)) {
      if (!selected.some((item) => item.id === question.id)) selected.push(question)
      if (selected.length >= count) return selected
    }
  }

  return balancedPick(PSYCHOLOGY_QUESTIONS, count, seed).filter(
    (question, index, list) => list.findIndex((item) => item.id === question.id) === index
  )
}

export function getPsychologyExamSimulation(seed = 1) {
  const selected: PsychologyQuestion[] = []
  const add = (questions: PsychologyQuestion[], max: number) => {
    for (const question of seededQuestions(questions, seed + selected.length)) {
      if (!selected.some((item) => item.id === question.id)) selected.push(question)
      if (selected.length >= max) break
    }
  }

  add(PSYCHOLOGY_CLASSES.flatMap((item) => seededQuestions(getPsychologyQuestionsByClass(item.id), seed).slice(0, 2)), 8)
  add(PSYCHOLOGY_QUESTIONS.filter((question) => question.type === "application_case"), 14)
  add(PSYCHOLOGY_QUESTIONS.filter((question) => question.type === "integrative_question"), 18)
  add(PSYCHOLOGY_QUESTIONS, 20)

  return selected.slice(0, 20)
}

export function getPsychologyClassSummary(classId: string) {
  return PSYCHOLOGY_CLASSES.find((item) => item.id === classId) ?? null
}

export function getPsychologyQuestionById(questionId: string) {
  return PSYCHOLOGY_QUESTIONS.find((question) => question.id === questionId) ?? null
}

export function getPsychologyQuestionCounts() {
  return {
    total: PSYCHOLOGY_QUESTIONS.length,
    byClass: Object.fromEntries(
      PSYCHOLOGY_CLASSES.map((item) => [item.id, getPsychologyQuestionsByClass(item.id).length])
    ),
    byType: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.type] = (acc[question.type] ?? 0) + 1
      return acc
    }, {}),
    byDifficulty: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.difficulty] = (acc[question.difficulty] ?? 0) + 1
      return acc
    }, {}),
  }
}

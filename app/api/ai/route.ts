import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSubjectPrompt } from '../../../lib/subject-prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

type PracticeFormat =
  | 'multiple-choice'
  | 'true-false'
  | 'flashcards'
  | 'open'
  | 'problem-solving'
  | 'exam'
  | 'all'

function extractJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = text.slice(firstBrace, lastBrace + 1)
      return JSON.parse(sliced)
    }

    const firstBracket = text.indexOf('[')
    const lastBracket = text.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const sliced = text.slice(firstBracket, lastBracket + 1)
      return JSON.parse(sliced)
    }

    throw new Error('No se pudo parsear JSON')
  }
}

async function askAI(system: string, user: string) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  return response.choices[0]?.message?.content || ''
}

function buildSubjectGuidelines(subject: string) {
  const normalized = subject.toLowerCase()

  if (normalized.includes('historia')) {
    return `
- Evita juicio binario o visión blanco/negro.
- Relaciona autores entre sí.
- Contextualiza por qué se dice algo, qué dice y cuál es la tesis central.
- Vincula continuidad y ruptura.
- Relaciona con Chile, el mundo, cultura, cine, arte y efectos actuales.
- Usa conectores y no fragmentes como santuario de contenido aislado.
- Si aparece democracia, considera herencias de la Guerra Fría y rupturas antidemocráticas.
- Si aparecen grupos perseguidos, analiza sus efectos sociales e históricos.
`
  }

  if (normalized.includes('precál') || normalized.includes('mate')) {
    return `
- Prioriza ejercicios de procedimiento.
- Incluye errores frecuentes, interpretación y resolución paso a paso.
- Evita depender de verdadero/falso como modo principal.
- Mezcla cálculo, planteamiento y análisis de errores.
`
  }

  if (normalized.includes('psicolog')) {
    return `
- Prioriza comprensión conceptual.
- Usa ejemplos aplicados.
- En temas de memoria, sugiere estrategias de recuperación activa, asociación, organización y repetición espaciada.
- Mezcla definición, comprensión, aplicación y comparación.
`
  }

  return `
- Mezcla definición, comprensión, comparación y aplicación.
- Evita inventar información fuera del material proporcionado.
`
}

async function generatePracticeQuestions(input: {
  subject: string
  topic: string
  difficulty?: string
  count?: number
  format?: PracticeFormat
  source?: string
}) {
  const count = Math.min(Math.max(Number(input.count || 10), 1), 25)
  const format = input.format || 'multiple-choice'
  const subjectGuidelines = buildSubjectGuidelines(input.subject)

  const system = `
Eres un generador de preguntas académicas en español nivel universitario.
Debes responder SOLO con JSON válido.
No uses markdown.
No agregues texto fuera del JSON.

${subjectGuidelines}

Formato obligatorio:
{
  "questions": [
    {
      "question": "texto",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "explicación breve"
    }
  ]
}

Reglas:
- Si el formato es "multiple-choice", devuelve 4 alternativas.
- Si el formato es "true-false", devuelve 2 alternativas exactas: ["Verdadero", "Falso"] y answerIndex 0 o 1.
- Si el formato es "flashcards", devuelve igualmente questions con explanation útil.
- Si el formato es "open" o "problem-solving", devuelve "options": [] y "answerIndex": 0.
- Si el formato es "exam", genera preguntas tipo prueba.
- Si el formato es "all", mezcla pregunta conceptual, aplicada, de comparación y de error frecuente.
- Las respuestas correctas deben variar su posición.
- Las preguntas deben ser útiles, claras, universitarias y no repetitivas.
`

  const user = JSON.stringify({
    subject: input.subject,
    topic: input.topic,
    difficulty: input.difficulty || 'media',
    count,
    format,
    source: input.source || 'general',
  })

  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    questions: Array.isArray(parsed?.questions) ? parsed.questions : [],
  }
}

async function reviewSteps(input: {
  problem: string
  steps: string[]
}) {
  const system = `
Eres un tutor académico en español que revisa procedimientos paso a paso.
Debes responder SOLO con JSON válido.
No uses markdown.
No agregues texto fuera del JSON.

Formato:
{
  "review": {
    "verdict": "correcto" | "revisar" | "incorrecto",
    "feedback": "texto breve",
    "likelyError": "texto breve",
    "correctedHint": "texto breve",
    "problematicStepIndex": 0
  }
}

Reglas:
- Si el ejercicio parece correcto, igual indica si hay algo que revisar.
- problematicStepIndex debe ser el índice 0-based del paso más conflictivo.
- Si no estás seguro, elige el primer paso sospechoso.
- Sé claro, breve y útil.
`

  const user = JSON.stringify(input)
  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    review: {
      verdict: parsed?.review?.verdict || 'revisar',
      feedback: parsed?.review?.feedback || 'Revisa el procedimiento.',
      likelyError:
        parsed?.review?.likelyError ||
        'Puede haber un error de operación o interpretación.',
      correctedHint:
        parsed?.review?.correctedHint ||
        'Vuelve a desarrollar el paso señalado con más detalle.',
      problematicStepIndex:
        typeof parsed?.review?.problematicStepIndex === 'number'
          ? parsed.review.problematicStepIndex
          : 0,
    },
  }
}

async function generateStudyCoachSummary(input: {
  weeklyHours: number
  blocks: Array<{
    day: string
    subject: string
    topic: string
    minutes: number
    reason: string
    priority: number
  }>
}) {
  const system = `
Eres un coach académico universitario en español.
Debes responder SOLO con JSON válido.

Formato:
{
  "summary": "texto"
}

Haz un resumen semanal claro, humano y accionable.
Debe:
- explicar por qué se priorizan ciertos ramos y temas
- mencionar distribución de horas
- dar consejo diario breve
- sonar como un coach académico real
- no usar markdown
`

  const user = JSON.stringify(input)
  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    summary:
      parsed?.summary ||
      'Esta semana conviene priorizar los temas con más riesgo y menor precisión. Mantén sesiones constantes y enfócate primero en los bloques de mayor impacto.',
  }
}

async function analyzeLearningProfile(input: {
  subject?: string
  userContext?: string
  recentMistakes?: string[]
  preferredStudyStyle?: string
  availableHours?: number
}) {
  const system = `
Eres un orientador académico en español.
Tu tarea es detectar el perfil de aprendizaje práctico de un estudiante.
No uses etiquetas rígidas ni pseudociencia.
Debes sugerir estrategias útiles de memoria, atención, repaso y práctica.

Responde SOLO con JSON válido.

Formato:
{
  "profile": {
    "learningStyleSummary": "texto",
    "bestMemoryApproaches": ["...", "...", "..."],
    "bestPracticeApproaches": ["...", "...", "..."],
    "warningPoints": ["...", "..."],
    "recommendedRoutine": "texto"
  }
}
`

  const user = JSON.stringify(input)
  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    profile: {
      learningStyleSummary:
        parsed?.profile?.learningStyleSummary ||
        'Tu perfil parece beneficiarse más de estudio activo, repaso frecuente y práctica guiada.',
      bestMemoryApproaches: Array.isArray(parsed?.profile?.bestMemoryApproaches)
        ? parsed.profile.bestMemoryApproaches
        : [
            'repetición espaciada',
            'preguntas de recuperación',
            'explicar con tus palabras',
          ],
      bestPracticeApproaches: Array.isArray(parsed?.profile?.bestPracticeApproaches)
        ? parsed.profile.bestPracticeApproaches
        : [
            'resolver ejercicios por bloques cortos',
            'revisar errores inmediatamente',
            'alternar teoría y práctica',
          ],
      warningPoints: Array.isArray(parsed?.profile?.warningPoints)
        ? parsed.profile.warningPoints
        : [
            'leer pasivamente sin preguntar',
            'estudiar mucho tiempo seguido sin pausas',
          ],
      recommendedRoutine:
        parsed?.profile?.recommendedRoutine ||
        'Empieza con repaso corto, sigue con preguntas activas, luego corrige errores y termina resumiendo con tus palabras.',
    },
  }
}

async function generateQuestionsFromText(input: {
  text: string
  subject: string
  topic?: string
  count?: number
  format?: PracticeFormat
  difficulty?: string
}) {
  const count = Math.min(Math.max(Number(input.count || 10), 1), 20)
  const format = input.format || 'multiple-choice'
  const subjectGuidelines = buildSubjectGuidelines(input.subject)

  const system = `
Eres un generador de preguntas de estudio en español basado SOLO en un texto dado.
Debes responder SOLO con JSON válido.

${subjectGuidelines}

Formato:
{
  "questions": [
    {
      "question": "texto",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "explicación breve"
    }
  ],
  "summary": "resumen breve"
}

Reglas:
- Usa únicamente el contenido del texto entregado.
- Si el formato es "multiple-choice", usa 4 alternativas.
- Si el formato es "true-false", usa ["Verdadero", "Falso"].
- Si el formato es "open", usa options vacías.
- Las preguntas deben servir para estudiar sin releer todo el texto.
- Mezcla comprensión, definición, comparación y aplicación.
- No inventes datos que no estén en el texto.
- En Historia, integra temas y conectores entre ideas.
Si la asignatura es Precálculo:
- genera funciones matemáticas (ej: x^2 - 4)
- incluye campo "graph"
- crea preguntas basadas en el gráfico
- NO hagas teoría
- SOLO ejercicios
`

  const trimmedText =
    input.text.length > 14000 ? input.text.slice(0, 14000) : input.text

  const user = JSON.stringify({
    subject: input.subject,
    topic: input.topic || 'General',
    difficulty: input.difficulty || 'media',
    count,
    format,
    text: trimmedText,
  })

  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    questions: Array.isArray(parsed?.questions) ? parsed.questions : [],
    summary: parsed?.summary || '',
  }
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function generateChatResponse(input: {
  systemPrompt: string
  messages: ChatMessage[]
}) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.6,
    messages: [
      { role: 'system', content: input.systemPrompt },
      ...input.messages,
    ],
  })

  return {
    response: response.choices[0]?.message?.content || '',
  }
}

async function generateTest(input: {
  subject: string
  evaluationType: string
  topic?: string
  content: string
}) {
  const system = `
Eres un profesor universitario que transforma contenido de estudio en una prueba académica clara y útil.
Debes responder SOLO con JSON válido.
No uses markdown.
No agregues texto fuera del JSON.

Formato:
{
  "test": {
    "title": "texto",
    "instructions": "texto",
    "multipleChoice": [
      {
        "question": "texto",
        "options": ["A", "B", "C", "D"],
        "answerIndex": 0
      }
    ],
    "openQuestions": ["texto"],
    "hardQuestion": "texto"
  }
}

Reglas:
- Genera 3-4 preguntas de alternativa múltiple y 2 preguntas abiertas.
- Usa la materia y el tema proporcionados.
- Haz que las preguntas sean útiles para repasar el contenido.
- Mantén un nivel universitario.
`

  const user = JSON.stringify({
    subject: input.subject,
    evaluationType: input.evaluationType,
    topic: input.topic || 'General',
    content: input.content.slice(0, 14000),
  })

  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    test: parsed?.test || null,
  }
}

async function generateStudyPlan(input: {
  subject?: string
  weeklyHours: number
  evaluations?: Array<Record<string, any>>
  availability?: Array<Record<string, any>>
  weaknesses?: Array<Record<string, any>>
  goal?: string
}) {
  const system = `
Eres un planificador académico en español.
Debes generar un plan de estudio semanal útil y accionable.
Responde SOLO con JSON válido.
No uses markdown.
No agregues texto fuera del JSON.

Formato:
{
  "plan": [
    {
      "day": "Lunes",
      "subject": "texto",
      "topic": "texto",
      "minutes": 45,
      "reason": "texto",
      "priority": 1
    }
  ],
  "summary": "texto breve"
}

Reglas:
- Usa la disponibilidad para distribuir bloques de 30 a 90 minutos.
- Prioriza evaluaciones próximas y temas con debilidades.
- Si no hay datos suficientes, devuelve un plan vacío y un resumen claro.
- Mantén el plan práctico y enfocado en resultados semanales.
`

  const user = JSON.stringify({
    subject: input.subject || 'General',
    weeklyHours: input.weeklyHours,
    goal: input.goal || 'Organizar el estudio',
    evaluations: input.evaluations || [],
    availability: input.availability || [],
    weaknesses: input.weaknesses || [],
  })

  const raw = await askAI(system, user)
  const parsed = extractJson(raw)

  return {
    plan: Array.isArray(parsed?.plan) ? parsed.plan : [],
    summary:
      parsed?.summary ||
      'Genera un plan equilibrado según tus evaluaciones, disponibilidad y horas semanales.',
  }
}

async function genericPrompt(input: { prompt: string }) {
  const system = `
Responde en español.
Si el usuario pide estructura, dásela clara.
Si se puede, responde de forma académica, útil y ordenada.
`

  const raw = await askAI(system, input.prompt)

  return {
    output: raw,
  }
}

async function generateDetailedSummary(input: {
  subject: string
  unit?: string
  topic?: string
  readingTitle?: string
  readingAuthors?: string
  evaluationTarget?: any
  text: string
  mode?: string
}) {
  const prompt = buildSubjectPrompt('summary', {
    subject: input.subject,
    unit: input.unit,
    topic: input.topic,
    readingTitle: input.readingTitle,
    readingAuthors: input.readingAuthors,
    evaluationTarget: input.evaluationTarget || 'todas',
    extraInstruction: `
Modo solicitado: ${input.mode || 'resumen detallado'}

Texto base:
"""
${input.text.slice(0, 14000)}
"""
`,
  })

  const system = `
Eres un profesor universitario experto nivel UC.
Debes crear resúmenes largos, claros, detallados y realmente útiles para estudiar.
No respondas en 2 líneas.
No inventes información fuera del texto entregado.
`

  const raw = await askAI(system, prompt)

  return {
    text: raw,
    summary: raw,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const task = body?.task
    
    if (!task && body?.prompt) {
      const data = await genericPrompt({ prompt: body.prompt })
      return NextResponse.json(data)
    }

    if (!task) {
      return NextResponse.json(
        { error: 'Falta task' },
        { status: 400 }
      )
    }

    if (task === 'generate-practice-questions') {
      const data = await generatePracticeQuestions({
        subject: body.subject,
        topic: body.topic,
        difficulty: body.difficulty,
        count: body.count,
        format: body.format,
        source: body.source,
      })

      return NextResponse.json(data)
    }

    if (task === 'review-steps') {
      const data = await reviewSteps({
        problem: body.problem,
        steps: Array.isArray(body.steps) ? body.steps : [],
      })

      return NextResponse.json(data)
    }

    if (task === 'study-coach-summary') {
      const data = await generateStudyCoachSummary({
        weeklyHours: Number(body.weeklyHours || 35),
        blocks: Array.isArray(body.blocks) ? body.blocks : [],
      })

      return NextResponse.json(data)
    }

    if (task === 'analyze-learning-profile') {
      const data = await analyzeLearningProfile({
        subject: body.subject,
        userContext: body.userContext,
        recentMistakes: Array.isArray(body.recentMistakes)
          ? body.recentMistakes
          : [],
        preferredStudyStyle: body.preferredStudyStyle,
        availableHours: Number(body.availableHours || 0),
      })

      return NextResponse.json(data)
    }

    if (task === 'generate-questions-from-text') {
      const data = await generateQuestionsFromText({
        text: body.text || '',
        subject: body.subject || 'General',
        topic: body.topic,
        count: body.count,
        format: body.format,
        difficulty: body.difficulty,
      })

      return NextResponse.json(data)
    }

    if (task === 'generate-test') {
      const data = await generateTest({
        subject: body.subject || 'General',
        evaluationType: body.evaluationType || 'Prueba',
        topic: body.topic,
        content: body.content || '',
      })

      return NextResponse.json(data)
    }

    if (task === 'generate-study-plan') {
      const data = await generateStudyPlan({
        subject: body.subject,
        weeklyHours: Number(body.weeklyHours || 35),
        evaluations: Array.isArray(body.evaluations) ? body.evaluations : [],
        availability: Array.isArray(body.availability) ? body.availability : [],
        weaknesses: Array.isArray(body.weaknesses) ? body.weaknesses : [],
        goal: body.goal,
      })

      return NextResponse.json(data)
    }

    if (task === 'chat') {
      const data = await generateChatResponse({
        systemPrompt: body.systemPrompt || '',
        messages: Array.isArray(body.messages) ? body.messages : [],
      })

      return NextResponse.json(data)
    }

    if (task === 'generate-summary') {
      const data = await generateDetailedSummary({
        subject: body.subject || 'General',
        unit: body.unit,
        topic: body.topic,
        readingTitle: body.readingTitle,
        readingAuthors: body.readingAuthors,
        evaluationTarget: body.evaluationTarget,
        text: body.text || '',
        mode: body.mode,
      })

      return NextResponse.json(data)
    }

    return NextResponse.json(
      { error: 'Task no soportada' },
      { status: 400 }
    )
  } catch (error) {
    console.error('AI ROUTE ERROR:', error)
    return NextResponse.json(
      { error: 'Error interno en /api/ai' },
      { status: 500 }
    )
  }
}
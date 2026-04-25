import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSubjectPrompt } from '../../../lib/subject-prompts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

let openaiClient: OpenAI | null = null

function getOpenAI() {
  if (openaiClient) return openaiClient

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada')
  }

  openaiClient = new OpenAI({ apiKey })

  return openaiClient
}

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
      return JSON.parse(text.slice(firstBrace, lastBrace + 1))
    }

    const firstBracket = text.indexOf('[')
    const lastBracket = text.lastIndexOf(']')

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1))
    }

    throw new Error('No se pudo parsear JSON')
  }
}

async function askAI(system: string, user: string, temperature = 0.4) {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  return response.choices[0]?.message?.content || ''
}

function buildSubjectGuidelines(subject: string) {
  const normalized = String(subject || '').toLowerCase()

  if (normalized.includes('historia')) {
    return `
- Evita juicio binario.
- Relaciona autores, procesos, continuidad y ruptura.
- Contextualiza tesis, causas, consecuencias y efectos actuales.
- Vincula con Chile, mundo, cultura, cine y arte cuando corresponda.
`
  }

  if (normalized.includes('precál') || normalized.includes('mate')) {
    return `
- Prioriza ejercicios de procedimiento.
- Incluye errores frecuentes, interpretación y resolución paso a paso.
- Mezcla cálculo, planteamiento y análisis.
`
  }

  if (normalized.includes('psicolog')) {
    return `
- Prioriza comprensión conceptual.
- Usa ejemplos aplicados.
- Sugiere recuperación activa, asociación, organización y repetición espaciada.
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

  const system = `
Eres un generador de preguntas académicas en español nivel universitario.
Debes responder SOLO con JSON válido. No uses markdown.

${buildSubjectGuidelines(input.subject)}

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
- multiple-choice: 4 alternativas.
- true-false: ["Verdadero", "Falso"].
- open/problem-solving: options [] y answerIndex 0.
- exam: preguntas tipo prueba.
- all: mezcla conceptual, aplicada, comparación y error frecuente.
- Varía la posición correcta.
`

  const raw = await askAI(
    system,
    JSON.stringify({
      subject: input.subject,
      topic: input.topic,
      difficulty: input.difficulty || 'media',
      count,
      format,
      source: input.source || 'general',
    })
  )

  const parsed = extractJson(raw)

  return {
    questions: Array.isArray(parsed?.questions) ? parsed.questions : [],
  }
}

async function reviewSteps(input: { problem: string; steps: string[] }) {
  const system = `
Eres un tutor académico en español que revisa procedimientos paso a paso.
Responde SOLO con JSON válido.

Formato:
{
  "review": {
    "verdict": "correcto",
    "feedback": "texto breve",
    "likelyError": "texto breve",
    "correctedHint": "texto breve",
    "problematicStepIndex": 0
  }
}
`

  const parsed = extractJson(await askAI(system, JSON.stringify(input)))

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
Responde SOLO con JSON válido.

Formato:
{
  "summary": "texto"
}
`

  const parsed = extractJson(await askAI(system, JSON.stringify(input)))

  return {
    summary:
      parsed?.summary ||
      'Esta semana conviene priorizar los temas con más riesgo y mantener sesiones constantes.',
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
No uses pseudociencia.
Responde SOLO con JSON válido.

Formato:
{
  "profile": {
    "learningStyleSummary": "texto",
    "bestMemoryApproaches": ["..."],
    "bestPracticeApproaches": ["..."],
    "warningPoints": ["..."],
    "recommendedRoutine": "texto"
  }
}
`

  const parsed = extractJson(await askAI(system, JSON.stringify(input)))

  return {
    profile: {
      learningStyleSummary:
        parsed?.profile?.learningStyleSummary ||
        'Tu perfil parece beneficiarse del estudio activo y la práctica guiada.',
      bestMemoryApproaches: Array.isArray(parsed?.profile?.bestMemoryApproaches)
        ? parsed.profile.bestMemoryApproaches
        : ['repetición espaciada', 'preguntas de recuperación', 'explicar con tus palabras'],
      bestPracticeApproaches: Array.isArray(parsed?.profile?.bestPracticeApproaches)
        ? parsed.profile.bestPracticeApproaches
        : ['resolver por bloques', 'corregir errores', 'alternar teoría y práctica'],
      warningPoints: Array.isArray(parsed?.profile?.warningPoints)
        ? parsed.profile.warningPoints
        : ['leer pasivamente', 'estudiar sin pausas'],
      recommendedRoutine:
        parsed?.profile?.recommendedRoutine ||
        'Empieza con repaso corto, sigue con preguntas activas y termina corrigiendo errores.',
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

  const system = `
Eres un generador de preguntas basado SOLO en un texto dado.
Responde SOLO con JSON válido.

${buildSubjectGuidelines(input.subject)}

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
`

  const parsed = extractJson(
    await askAI(
      system,
      JSON.stringify({
        subject: input.subject,
        topic: input.topic || 'General',
        difficulty: input.difficulty || 'media',
        count,
        format,
        text: input.text.slice(0, 14000),
      })
    )
  )

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
  const openai = getOpenAI()

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
Eres un profesor universitario que transforma contenido en prueba académica.
Responde SOLO con JSON válido.

Formato:
{
  "test": {
    "title": "texto",
    "instructions": "texto",
    "multipleChoice": [],
    "openQuestions": [],
    "hardQuestion": "texto"
  }
}
`

  const parsed = extractJson(
    await askAI(
      system,
      JSON.stringify({
        subject: input.subject,
        evaluationType: input.evaluationType,
        topic: input.topic || 'General',
        content: input.content.slice(0, 14000),
      })
    )
  )

  return {
    test: parsed?.test || null,
  }
}

async function generateStudyPlan(input: {
  subject?: string
  weeklyHours: number
  evaluations?: Array<Record<string, unknown>>
  availability?: Array<Record<string, unknown>>
  weaknesses?: Array<Record<string, unknown>>
  goal?: string
}) {
  const system = `
Eres un planificador académico en español.
Responde SOLO con JSON válido.

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
`

  const parsed = extractJson(await askAI(system, JSON.stringify(input)))

  return {
    plan: Array.isArray(parsed?.plan) ? parsed.plan : [],
    summary:
      parsed?.summary ||
      'Genera un plan equilibrado según tus evaluaciones, disponibilidad y horas semanales.',
  }
}

async function genericPrompt(input: { prompt: string }) {
  const raw = await askAI(
    'Responde en español de forma académica, útil y ordenada.',
    input.prompt,
    0.5
  )

  return { output: raw }
}

async function generateDetailedSummary(input: {
  subject: string
  unit?: string
  topic?: string
  readingTitle?: string
  readingAuthors?: string
  evaluationTarget?: unknown
  text: string
  mode?: string
}) {
  const prompt = buildSubjectPrompt('summary', {
    subject: input.subject,
    unit: input.unit,
    topic: input.topic,
    readingTitle: input.readingTitle,
    readingAuthors: input.readingAuthors,
    evaluationTarget: (input.evaluationTarget as any) || 'todas',
    extraInstruction: `
Modo solicitado: ${input.mode || 'resumen detallado'}

Texto base:
"""
${input.text.slice(0, 14000)}
"""
`,
  })

  const raw = await askAI(
    `
Eres un profesor universitario experto nivel UC.
Crea resúmenes largos, claros, detallados y útiles para estudiar.
No inventes información fuera del texto.
`,
    prompt
  )

  return {
    text: raw,
    summary: raw,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const task = body?.task

    if (!task && body?.prompt) {
      return NextResponse.json(await genericPrompt({ prompt: body.prompt }))
    }

    if (!task) {
      return NextResponse.json({ error: 'Falta task' }, { status: 400 })
    }

    if (task === 'generate-practice-questions') {
      return NextResponse.json(
        await generatePracticeQuestions({
          subject: body.subject || 'General',
          topic: body.topic || 'General',
          difficulty: body.difficulty,
          count: body.count,
          format: body.format,
          source: body.source,
        })
      )
    }

    if (task === 'review-steps') {
      return NextResponse.json(
        await reviewSteps({
          problem: body.problem || '',
          steps: Array.isArray(body.steps) ? body.steps : [],
        })
      )
    }

    if (task === 'study-coach-summary') {
      return NextResponse.json(
        await generateStudyCoachSummary({
          weeklyHours: Number(body.weeklyHours || 35),
          blocks: Array.isArray(body.blocks) ? body.blocks : [],
        })
      )
    }

    if (task === 'analyze-learning-profile') {
      return NextResponse.json(
        await analyzeLearningProfile({
          subject: body.subject,
          userContext: body.userContext,
          recentMistakes: Array.isArray(body.recentMistakes) ? body.recentMistakes : [],
          preferredStudyStyle: body.preferredStudyStyle,
          availableHours: Number(body.availableHours || 0),
        })
      )
    }

    if (task === 'generate-questions-from-text') {
      return NextResponse.json(
        await generateQuestionsFromText({
          text: body.text || '',
          subject: body.subject || 'General',
          topic: body.topic,
          count: body.count,
          format: body.format,
          difficulty: body.difficulty,
        })
      )
    }

    if (task === 'generate-test') {
      return NextResponse.json(
        await generateTest({
          subject: body.subject || 'General',
          evaluationType: body.evaluationType || 'Prueba',
          topic: body.topic,
          content: body.content || '',
        })
      )
    }

    if (task === 'generate-study-plan') {
      return NextResponse.json(
        await generateStudyPlan({
          subject: body.subject,
          weeklyHours: Number(body.weeklyHours || 35),
          evaluations: Array.isArray(body.evaluations) ? body.evaluations : [],
          availability: Array.isArray(body.availability) ? body.availability : [],
          weaknesses: Array.isArray(body.weaknesses) ? body.weaknesses : [],
          goal: body.goal,
        })
      )
    }

    if (task === 'chat') {
      return NextResponse.json(
        await generateChatResponse({
          systemPrompt: body.systemPrompt || '',
          messages: Array.isArray(body.messages) ? body.messages : [],
        })
      )
    }

    if (task === 'generate-summary') {
      return NextResponse.json(
        await generateDetailedSummary({
          subject: body.subject || 'General',
          unit: body.unit,
          topic: body.topic,
          readingTitle: body.readingTitle,
          readingAuthors: body.readingAuthors,
          evaluationTarget: body.evaluationTarget,
          text: body.text || '',
          mode: body.mode,
        })
      )
    }

    return NextResponse.json({ error: 'Task no soportada' }, { status: 400 })
  } catch (error) {
    console.error('AI ROUTE ERROR:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error interno en /api/ai',
      },
      { status: 500 }
    )
  }
}
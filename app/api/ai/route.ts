import { NextResponse } from 'next/server'

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

function fallbackReply(message: string, context: any) {
  const subject = context?.subject || 'tu ramo'
  const topic = context?.topic || 'la materia'
  const type = context?.type || 'la evaluación'

  const normalized = message.toLowerCase()

  if (normalized.includes('simple') || normalized.includes('fácil')) {
    return `Te lo explico fácil para ${subject}. El foco aquí es ${topic}. Parte entendiendo la idea principal, luego revisa un ejemplo básico y recién después practica una pregunta parecida a ${type}.`
  }

  if (normalized.includes('resumen')) {
    return `Resumen rápido de ${topic} en ${subject}: identifica la definición principal, los pasos clave, un ejemplo típico y el error más común. Si esto es para ${type}, conviene cerrar primero la base y después hacer práctica.`
  }

  if (normalized.includes('ejercicio') || normalized.includes('prueba')) {
    return `Para practicar ${topic} en ${subject}, haz primero una pregunta básica, luego una intermedia y termina con una tipo ${type}. Corrige el procedimiento, no solo la respuesta final.`
  }

  if (normalized.includes('qué estudiar hoy') || normalized.includes('que estudiar hoy')) {
    return `Hoy prioriza ${topic} de ${subject}. Haz una sesión corta de comprensión, una de práctica y deja 10 minutos finales para resumir errores.`
  }

  if (normalized.includes('error') || normalized.includes('errores')) {
    return `En ${topic} de ${subject}, los errores típicos suelen venir de confundir definiciones, saltarse pasos o aplicar mal una regla. Conviene revisar procedimiento y no solo la respuesta final.`
  }

  return `Te ayudo con ${subject}. Para esta evaluación sobre ${topic}, primero identifica lo central, luego dime si quieres que te lo explique fácil, te haga un resumen o te prepare ejercicios tipo ${type}.`
}

function fallbackGeneratedTest(subject: string, content: string) {
  const trimmed = content.trim()
  const baseTopic =
    trimmed.split(/[.!?\n]/).map((x) => x.trim()).filter(Boolean)[0] ||
    'el contenido subido'

  return {
    title: `Prueba generada · ${subject || 'General'}`,
    instructions:
      'Responde primero sin ayuda. Después revisa tus errores y compáralos con el contenido original.',
    multipleChoice: [
      {
        question: `¿Cuál es la idea principal de ${baseTopic}?`,
        options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        answerIndex: 0,
      },
      {
        question: `¿Qué concepto está más relacionado con ${baseTopic}?`,
        options: ['Concepto 1', 'Concepto 2', 'Concepto 3', 'Concepto 4'],
        answerIndex: 1,
      },
      {
        question: `¿Qué error sería más común al estudiar ${baseTopic}?`,
        options: ['Confundir definiciones', 'Saltar pasos', 'Memorizar sin comprender', 'Todas las anteriores'],
        answerIndex: 3,
      },
      {
        question: `¿Qué conviene hacer primero con ${baseTopic}?`,
        options: ['Comprender la base', 'Memorizar sin contexto', 'Ignorar ejemplos', 'Saltar a la última parte'],
        answerIndex: 0,
      },
      {
        question: `¿Qué enfoque mejora más el aprendizaje de ${baseTopic}?`,
        options: ['Práctica activa', 'Lectura pasiva', 'Estudio al azar', 'Ninguno'],
        answerIndex: 0,
      },
    ],
    openQuestions: [
      `Explica con tus palabras ${baseTopic}.`,
      `Da un ejemplo relacionado con ${baseTopic}.`,
    ],
    hardQuestion: `Analiza ${baseTopic} y explica por qué es importante dentro de ${subject || 'la materia'}.`,
  }
}

function fallbackStepReview(problem: string, steps: string[]) {
  const lastStep = steps[steps.length - 1] || 'tu último paso'
  return {
    verdict: 'revisar',
    feedback:
      `Revisa el paso "${lastStep}". Puede haber un error de procedimiento o una transformación no justificada. Contrasta ese paso con el problema original: ${problem}.`,
    likelyError:
      'Posible error de procedimiento, simplificación o cambio de signo.',
    correctedHint:
      'Vuelve al paso anterior válido y rehace la operación con calma, verificando signos, paréntesis y equivalencias.',
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      message,
      context,
      history,
      task,
      content,
      subject,
      evaluationType,
      topic,
      problem,
      steps,
    } = body as {
      message?: string
      context?: any
      history?: HistoryMessage[]
      task?: 'chat' | 'generate-test' | 'review-steps'
      content?: string
      subject?: string
      evaluationType?: string
      topic?: string
      problem?: string
      steps?: string[]
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (task === 'generate-test') {
      if (!content || typeof content !== 'string') {
        return NextResponse.json(
          { error: 'Falta contenido para generar la prueba' },
          { status: 400 }
        )
      }

      if (!apiKey) {
        return NextResponse.json({
          test: fallbackGeneratedTest(subject || 'General', content),
          source: 'fallback',
        })
      }

      const prompt = `
Eres un generador de evaluaciones universitarias en Chile.

Genera una prueba en JSON válido con esta estructura exacta:
{
  "title": string,
  "instructions": string,
  "multipleChoice": [
    {
      "question": string,
      "options": [string, string, string, string],
      "answerIndex": number
    }
  ],
  "openQuestions": [string, string],
  "hardQuestion": string
}

Reglas:
- idioma español
- contexto académico real
- preguntas claras
- evita relleno
- si el ramo es matemático, crea alternativas más técnicas
- si el ramo es de humanidades, prioriza análisis y comprensión
- entrega 5 preguntas alternativas, 2 abiertas y 1 difícil

Ramo: ${subject || 'General'}
Tipo de evaluación: ${evaluationType || 'Prueba'}
Tema: ${topic || 'No especificado'}

Contenido base:
${content}
`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.4,
          response_format: { type: 'json_object' },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('GENERATE TEST ERROR:', data)
        return NextResponse.json({
          test: fallbackGeneratedTest(subject || 'General', content),
          source: 'fallback',
        })
      }

      const parsed = JSON.parse(
        data?.choices?.[0]?.message?.content || '{}'
      )

      return NextResponse.json({
        test: parsed,
        source: 'openai',
      })
    }

    if (task === 'review-steps') {
      if (!problem || !Array.isArray(steps) || steps.length === 0) {
        return NextResponse.json(
          { error: 'Faltan el ejercicio o los pasos para revisar' },
          { status: 400 }
        )
      }

      if (!apiKey) {
        return NextResponse.json({
          review: fallbackStepReview(problem, steps),
          source: 'fallback',
        })
      }

      const prompt = `
Eres un corrector matemático universitario.
Tu tarea es revisar pasos escritos por el estudiante y detectar el PRIMER punto donde probablemente se equivocó.

Responde en JSON válido con esta estructura exacta:
{
  "verdict": "correcto" | "revisar" | "incorrecto",
  "feedback": string,
  "likelyError": string,
  "correctedHint": string
}

Reglas:
- español
- claro y directo
- no resuelvas todo completo
- di dónde está el error o si aún no se ve error
- si el paso final está bien, dilo
- enfócate en signos, equivalencias, simplificación, despeje o procedimiento

Problema:
${problem}

Pasos del estudiante:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('REVIEW STEPS ERROR:', data)
        return NextResponse.json({
          review: fallbackStepReview(problem, steps),
          source: 'fallback',
        })
      }

      const parsed = JSON.parse(
        data?.choices?.[0]?.message?.content || '{}'
      )

      return NextResponse.json({
        review: parsed,
        source: 'openai',
      })
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Falta la pregunta' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json({
        reply: fallbackReply(message, context),
        source: 'fallback',
      })
    }

    const systemPrompt = `
Eres un asistente académico universitario en Chile.
Tu tarea es ayudar a estudiar con lenguaje claro, ordenado y útil.
No rellenes. No divagues. Prioriza preparación para evaluaciones.

Contexto académico actual:
- Ramo: ${context?.subject || 'No especificado'}
- Tipo de evaluación: ${context?.type || 'No especificado'}
- Número: ${context?.number || 'No especificado'}
- Tema: ${context?.topic || 'No especificado'}
- Dificultad: ${context?.difficulty || 'media'}
- Rango de evaluación: ${context?.start_date || ''} a ${context?.end_date || ''}
- Notas del estudiante: ${context?.notes || 'Sin notas'}
- Modo recomendado: ${context?.mode || 'No especificado'}
- Estrategia sugerida: ${context?.strategy || 'No especificada'}

Responde siempre:
- claro
- directo
- con pasos concretos
- con ejemplos si ayudan
- en español
- pensando en preparar una evaluación real
`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...((Array.isArray(history) ? history : []).slice(-8).map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.content || ''),
      }))),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.45,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('AI ROUTE ERROR:', data)
      return NextResponse.json({
        reply: fallbackReply(message, context),
        source: 'fallback',
      })
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      fallbackReply(message, context)

    return NextResponse.json({
      reply,
      source: 'openai',
    })
  } catch (error) {
    console.error('AI ROUTE UNHANDLED ERROR:', error)

    return NextResponse.json({
      reply: 'No pude responder ahora mismo. Intenta reformular la pregunta en una sola frase.',
      source: 'fallback',
    })
  }
}
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { rawQuestionBlocks } from './question-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TABLE_NAME = 'questions'
const BATCH_SIZE = 200

function extractArrays(raw: string): any[] {
  const fixed = `[${raw.trim().replace(/\]\s*\[/g, '],[')}]`
  return JSON.parse(fixed).flat()
}

function normalizeText(value: any) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function getKey(q: any) {
  return [
    normalizeText(q.tema),
    normalizeText(q.subtema),
    normalizeText(q.pregunta),
  ].join('|')
}

function cleanQuestion(q: any) {
  return {
    tema: q.topic,
    subtema: q.subtopic,
    tipo: q.type,
    dificultad: q.difficulty,
    pregunta: q.question,
    opciones: q.options ?? null,
    respuesta_correcta: q.correct_answer ?? null,
    explicacion: q.explanation ?? null,
    respuesta_esperada: q.expected_answer ?? null,
    criterios_evaluacion: q.evaluation_criteria ?? null,
    nivel_cognitivo: q.cognitive_level ?? null,
    referencia_autor: q.author_reference ?? null,
    error_comun: q.common_mistake ?? null,
    tags: q.tags ?? [],
    fuente: q.source ?? null,
  }
}

function validateQuestion(q: any, index: number) {
  if (!q.topic || !q.subtopic || !q.type || !q.difficulty || !q.question) {
    throw new Error(`Pregunta ${index + 1} incompleta.`)
  }

  if (!['seleccion_multiple', 'desarrollo'].includes(q.type)) {
    throw new Error(`Pregunta ${index + 1}: tipo inválido.`)
  }

  if (q.type === 'seleccion_multiple') {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Pregunta ${index + 1}: selección múltiple debe tener 4 opciones.`)
    }

    if (!['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
      throw new Error(`Pregunta ${index + 1}: respuesta_correcta debe ser A, B, C o D.`)
    }
  }

  if (q.type === 'desarrollo') {
    if (q.options !== null || q.correct_answer !== null) {
      throw new Error(`Pregunta ${index + 1}: desarrollo debe tener options y correct_answer en null.`)
    }
  }
}

async function uploadQuestions() {
  const parsed = extractArrays(rawQuestionBlocks)

  console.log(`📦 Preguntas recibidas: ${parsed.length}`)

  parsed.forEach(validateQuestion)

  const cleaned = parsed.map(cleanQuestion)

  const localMap = new Map<string, any>()

  for (const q of cleaned) {
    const key = getKey(q)
    if (!localMap.has(key)) {
      localMap.set(key, q)
    }
  }

  const uniqueQuestions = Array.from(localMap.values())

  console.log(`🧹 Preguntas únicas locales: ${uniqueQuestions.length}`)

  const { data: existing, error: readError } = await supabase
    .from(TABLE_NAME)
    .select('tema, subtema, pregunta')

  if (readError) {
    console.error('❌ Error leyendo preguntas existentes:', readError)
    process.exit(1)
  }

  const existingKeys = new Set((existing ?? []).map(getKey))

  const newQuestions = uniqueQuestions.filter((q) => !existingKeys.has(getKey(q)))

  console.log(`🆕 Preguntas nuevas: ${newQuestions.length}`)

  if (newQuestions.length === 0) {
    console.log('✅ No hay preguntas nuevas para subir.')
    return
  }

  let uploaded = 0

  for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
    const batch = newQuestions.slice(i, i + BATCH_SIZE)

    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(batch)

    if (error) {
      console.error(`❌ Error subiendo batch ${i / BATCH_SIZE + 1}:`, error)
      process.exit(1)
    }

    uploaded += batch.length
    console.log(`✅ Subidas ${uploaded}/${newQuestions.length}`)
  }

  console.log(`🎉 Listo. ${uploaded} preguntas subidas correctamente.`)
}

uploadQuestions()
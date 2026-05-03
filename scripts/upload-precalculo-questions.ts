import 'dotenv/config'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { questions } from '../data/precalculo-preguntas'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeQuestion(q: any) {
  return {
    asignatura: q.asignatura ?? 'Precálculo',
    modulo: q.modulo ?? null,
    unidad: q.unidad ?? null,
    tema: q.tema ?? 'General',
    subtema: q.subtema ?? null,
    tipo: q.tipo ?? 'seleccion_multiple',
    origen: q.origen ?? 'normal',
    evaluaciones: q.evaluaciones ?? [],
    pregunta: q.pregunta,
    opciones: q.opciones ?? [],
    respuesta_correcta: q.respuesta_correcta,
    dificultad: q.dificultad ?? 'media',
    concepto_clave: q.concepto_clave ?? null,
    nivel_cognitivo: q.nivel_cognitivo ?? 'intermedio',
    tipo_error: q.tipo_error ?? null,
    tiempo_estimado: q.tiempo_estimado ?? 60,
    pasos: q.pasos ?? [],
    operacion_visual: q.operacion_visual ?? [],
    visualizacion: q.visualizacion ?? null,
    pista: q.pista ?? null,
    error_comun: q.error_comun ?? null,
    mini_refuerzo: q.mini_refuerzo ?? null,
  }
}

async function main() {
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('❌ No hay preguntas')
    process.exit(1)
  }

  const payload = questions.map(normalizeQuestion)

  console.log(`🚀 Subiendo ${payload.length} preguntas...`)

  const { error } = await supabase
    .from('questions')
    .insert(payload)

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('✅ Subida completada')
}

main()

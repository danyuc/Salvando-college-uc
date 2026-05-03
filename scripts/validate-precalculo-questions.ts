import { questions } from '../data/precalculo-preguntas'

let ok = true

function fail(i: number, msg: string) {
  ok = false
  console.error(`❌ Pregunta ${i + 1}: ${msg}`)
}

questions.forEach((q: any, i: number) => {
  if (!q.pregunta) fail(i, 'falta pregunta')
  if (!q.asignatura) fail(i, 'falta asignatura')
  if (!q.modulo) fail(i, 'falta modulo')
  if (!q.subtema) fail(i, 'falta subtema')
  if (!Array.isArray(q.evaluaciones)) fail(i, 'evaluaciones debe ser array')
  if (!Array.isArray(q.pasos)) fail(i, 'pasos debe ser array')
  if (!Array.isArray(q.animaciones)) fail(i, 'animaciones debe ser array')
  if (!q.visualizacion) fail(i, 'falta visualizacion')

  if (q.tipo === 'seleccion_multiple') {
    if (!Array.isArray(q.opciones)) fail(i, 'opciones debe ser array')
    if (q.opciones?.length !== 4) fail(i, 'debe tener exactamente 4 opciones')
    if (!q.opciones?.includes(q.respuesta_correcta)) {
      fail(i, 'respuesta_correcta debe coincidir EXACTAMENTE con una opción')
    }
  }

  if (q.pregunta?.includes('3002^')) fail(i, 'posible error: falta * en 300*2^(t/5)')
  if (q.pregunta?.includes('-104^x')) fail(i, 'posible error: falta -10*4^x')
})

if (!ok) {
  console.error('\n🚫 Corrige antes de subir.')
  process.exit(1)
}

if (questions.length === 0) {
  console.error('❌ No hay preguntas en data/precalculo-preguntas.ts')
  process.exit(1)
}

console.log(`✅ Validación OK: ${questions.length} preguntas listas`)

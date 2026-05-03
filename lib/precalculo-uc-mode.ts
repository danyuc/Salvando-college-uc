
import { generateQuestion } from "./precalculo-engine"

type Attempt = {
  correct: boolean
  subtema: string
}

export function generateUCRealSet({
  modulo,
  subtema,
  dificultad,
  cantidad = 20,
  attempts = [],
}: {
  modulo: any
  subtema: string
  dificultad: any
  cantidad: number
  attempts: Attempt[]
}) {

  const mitad = Math.floor(cantidad / 2)

  // =========================
  // ERRORES FRECUENTES
  // =========================
  const errores = attempts
    .filter(a => !a.correct)
    .slice(-20)

  const erroresPorTema = errores.map(e => e.subtema)

  const preguntasErrores = erroresPorTema.slice(0, mitad).map(st =>
    generateQuestion({
      modulo,
      subtema: st,
      dificultad,
      origen: "prueba_real",
    })
  )

  // =========================
  // PREGUNTAS NUEVAS
  // =========================
  const preguntasNuevas = Array.from({ length: cantidad - preguntasErrores.length }).map(() =>
    generateQuestion({
      modulo,
      subtema,
      dificultad,
      origen: "prueba_real",
    })
  )

  return shuffle([...preguntasErrores, ...preguntasNuevas])
}

function shuffle(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5)
}

import { questions } from '@/data/precalculo-preguntas'

export function getBankQuestions({ modulo, subtema, cantidad = 10 }) {
  const filtered = questions.filter(q =>
    (!modulo || q.modulo === modulo) &&
    (!subtema || q.subtema === subtema)
  )

  return shuffle(filtered).slice(0, cantidad)
}

function shuffle(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5)
}

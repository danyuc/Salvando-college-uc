import { getBankQuestions } from "./precalculo-bank"
import { generateQuestion } from "./precalculo-engine"

export function getHybridSet({ modulo, subtema, cantidad = 20 }) {
  const banco = getBankQuestions({ modulo, subtema, cantidad: cantidad / 2 })

  const dinamicas = Array.from({ length: cantidad - banco.length }).map(() =>
    generateQuestion({ modulo, subtema, origen: "prueba_real" })
  )

  return shuffle([...banco, ...dinamicas])
}

function shuffle(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5)
}

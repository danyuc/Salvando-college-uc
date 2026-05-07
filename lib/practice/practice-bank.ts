import { LOG_NATURAL_BANK } from "@/lib/math/log-natural-bank"

export const PRACTICE_BANK = [
  ...LOG_NATURAL_BANK,

  {
    id: "prac-1",
    tema: "Pre cálculo",
    subtema: "valor_absoluto",
    pregunta: "Resolver |2x-1|=7",
    opciones: ["x=4 ó x=-3", "x=3 ó x=-4", "x=4", "x=-3"],
    correcta: "x=4 ó x=-3"
  },

  {
    id: "prac-2",
    tema: "Pre cálculo",
    subtema: "funcion_exponencial",
    pregunta: "Resolver 2^x=16",
    opciones: ["4", "8", "2", "16"],
    correcta: "4"
  }
]

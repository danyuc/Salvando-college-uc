export function lessonForQuestion(q: any) {
  if (q.tipo === "ecuacion_simple") {
    return {
      title: "Resolviendo paso a paso",
      steps: [
        {
          left: "10 + 2x",
          right: "30",
          action: "Restamos 10 en ambos lados",
        },
        {
          left: "2x",
          right: "30 - 10",
          action: "Simplificamos",
        },
        {
          left: "2x",
          right: "20",
          action: "Dividimos por 2",
        },
        {
          left: "x",
          right: "10",
          action: "Resultado final",
        },
      ],
    }
  }

  return null
}

export type GuidedStep = {
  title: string
  expression: string
  explanation: string
}

function txt(q: any) {
  return `${q?.pregunta || q?.text || ""} ${q?.subtema || ""} ${q?.tema || ""}`.toLowerCase()
}

export function getGuidedSolutionSteps(question: any): GuidedStep[] {
  const t = txt(question)

  if (t.includes("dominio") && (t.includes("√") || t.includes("raíz") || t.includes("raiz"))) {
    return [
      {
        title: "Condición de existencia",
        expression: "5-|8-x|\\ge 0",
        explanation: "Como hay una raíz cuadrada, el interior debe ser mayor o igual a cero.",
      },
      {
        title: "Aislar el valor absoluto",
        expression: "|8-x|\\le 5",
        explanation: "Pasamos el valor absoluto al otro lado de la desigualdad.",
      },
      {
        title: "Convertir a doble desigualdad",
        expression: "-5\\le 8-x\\le 5",
        explanation: "Si |A|≤5, entonces -5≤A≤5.",
      },
      {
        title: "Despejar x",
        expression: "3\\le x\\le 13",
        explanation: "Al resolver la doble desigualdad, x queda entre 3 y 13.",
      },
      {
        title: "Respuesta final",
        expression: "[3,13]",
        explanation: "Los extremos se incluyen porque la desigualdad es mayor o igual.",
      },
    ]
  }

  if (t.includes("distancia") || t.includes("puntos")) {
    return [
      {
        title: "Fórmula",
        expression: "d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}",
        explanation: "Usamos la fórmula de distancia entre dos puntos.",
      },
      {
        title: "Cambio horizontal",
        expression: "\\Delta x=x_2-x_1",
        explanation: "Restamos las coordenadas x en el mismo orden.",
      },
      {
        title: "Cambio vertical",
        expression: "\\Delta y=y_2-y_1",
        explanation: "Restamos las coordenadas y en el mismo orden.",
      },
      {
        title: "Sustituir y simplificar",
        expression: "d=\\sqrt{(\\Delta x)^2+(\\Delta y)^2}",
        explanation: "Elevamos al cuadrado ambos cambios y luego sumamos.",
      },
    ]
  }

  if (t.includes("pendiente") || t.includes("recta")) {
    return [
      {
        title: "Fórmula de pendiente",
        expression: "m=\\frac{y_2-y_1}{x_2-x_1}",
        explanation: "La pendiente es cambio vertical dividido por cambio horizontal.",
      },
      {
        title: "Sustituir puntos",
        expression: "m=\\frac{5-(-1)}{5-2}",
        explanation: "Se reemplazan las coordenadas entregadas en el ejercicio.",
      },
      {
        title: "Simplificar",
        expression: "m=\\frac{6}{3}=2",
        explanation: "La pendiente de la recta es 2.",
      },
    ]
  }

  if (t.includes("valor absoluto") || t.includes("|")) {
    return [
      {
        title: "Regla principal",
        expression: "|A|\\le k \\Rightarrow -k\\le A\\le k",
        explanation: "Cuando el valor absoluto es menor o igual, se transforma en doble desigualdad.",
      },
      {
        title: "Aplicar al ejercicio",
        expression: "-7\\le 2x-3\\le 7",
        explanation: "El interior del valor absoluto queda entre -7 y 7.",
      },
      {
        title: "Despejar",
        expression: "-2\\le x\\le 5",
        explanation: "Se suma 3 y luego se divide por 2.",
      },
      {
        title: "Respuesta final",
        expression: "[-2,5]",
        explanation: "Los extremos se incluyen porque era ≤.",
      },
    ]
  }

  if (t.includes("inecuación") || t.includes("inecuacion") || t.includes("cuadrática") || t.includes("cuadratica")) {
    return [
      {
        title: "Factorizar",
        expression: "x^2-x-6=(x-3)(x+2)",
        explanation: "Primero buscamos los puntos críticos factorizando.",
      },
      {
        title: "Raíces",
        expression: "x=-2,\\quad x=3",
        explanation: "Estos valores dividen la recta real en intervalos.",
      },
      {
        title: "Tabla de signos",
        expression: "(-\\infty,-2),\\ [-2,3],\\ (3,\\infty)",
        explanation: "Se analiza el signo de la expresión en cada intervalo.",
      },
      {
        title: "Solución",
        expression: "[-2,3]",
        explanation: "Si la parábola abre hacia arriba y se pide ≤0, se toma el intervalo entre las raíces.",
      },
    ]
  }

  if (t.includes("composición") || t.includes("composicion") || t.includes("f(g(x")) {
    return [
      {
        title: "Identificar función externa",
        expression: "f(x)=x^2+1",
        explanation: "La función externa es f. En ella se reemplaza la x.",
      },
      {
        title: "Reemplazar x por g(x)",
        expression: "f(g(x))=(g(x))^2+1",
        explanation: "Componer significa sustituir, no multiplicar.",
      },
      {
        title: "Sustituir g(x)",
        expression: "f(g(x))=\\left(\\frac{x-3}{x}\\right)^2+1",
        explanation: "Esa es la expresión compuesta correcta.",
      },
    ]
  }

  if (t.includes("vértice") || t.includes("vertice") || t.includes("parábola") || t.includes("parabola")) {
    return [
      {
        title: "Forma canónica",
        expression: "y=a(x-h)^2+k",
        explanation: "En esta forma, el vértice se lee directamente.",
      },
      {
        title: "Identificar h y k",
        expression: "y=-2(x-3)^2+8",
        explanation: "Aquí h=3 y k=8.",
      },
      {
        title: "Vértice",
        expression: "V=(3,8)",
        explanation: "El vértice es el punto (h,k).",
      },
    ]
  }

  if (t.includes("inyectiva") || t.includes("1-1")) {
    return [
      {
        title: "Criterio de inyectividad",
        expression: "f(a)=f(b)\\Rightarrow a=b",
        explanation: "Una función es inyectiva si no repite valores de salida.",
      },
      {
        title: "Contraejemplo típico",
        expression: "f(-1)=f(1)",
        explanation: "Si dos x distintas tienen la misma imagen, no es inyectiva.",
      },
      {
        title: "Conclusión",
        expression: "a\\ne b\\ \\text{y}\\ f(a)=f(b)\\Rightarrow \\text{no es inyectiva}",
        explanation: "Para x² en todo ℝ, -1 y 1 dan el mismo resultado.",
      },
    ]
  }

  if (t.includes("recorrido") || t.includes("rango")) {
    return [
      {
        title: "Qué se busca",
        expression: "R_f=\\{y:\\ y=f(x)\\}",
        explanation: "El recorrido son los valores posibles de y.",
      },
      {
        title: "Analizar mínimo o máximo",
        expression: "f(x)=|x|\\ge0",
        explanation: "El valor absoluto nunca es negativo.",
      },
      {
        title: "Recorrido",
        expression: "[0,\\infty)",
        explanation: "El menor valor es 0 y luego crece sin límite.",
      },
    ]
  }

  if (t.includes("seno") || t.includes("coseno") || t.includes("trigonom")) {
    return [
      {
        title: "Forma general",
        expression: "f(x)=A\\sin(B(x-C))+D",
        explanation: "Se identifican amplitud, período, desfase y eje medio.",
      },
      {
        title: "Amplitud",
        expression: "|A|",
        explanation: "Mide la distancia desde el eje medio hasta el máximo.",
      },
      {
        title: "Período",
        expression: "\\frac{2\\pi}{|B|}",
        explanation: "Indica cuánto tarda la función en repetir su ciclo.",
      },
    ]
  }

  if (t.includes("polinomio") || t.includes("ceros") || t.includes("factor")) {
    return [
      {
        title: "Ceros del polinomio",
        expression: "P(x)=0",
        explanation: "Los ceros son los puntos donde la gráfica corta o toca el eje x.",
      },
      {
        title: "Factor asociado",
        expression: "x=a\\Rightarrow (x-a)",
        explanation: "Si a es cero del polinomio, entonces (x-a) es factor.",
      },
      {
        title: "Multiplicidad",
        expression: "\\text{par: toca}\\quad \\text{impar: cruza}",
        explanation: "La multiplicidad indica cómo se comporta la gráfica en el cero.",
      },
    ]
  }

  return [
    {
      title: "Lectura matemática",
      expression: "Identificar\\ tema\\rightarrow elegir\\ propiedad\\rightarrow resolver",
      explanation: "Primero identifica si el ejercicio trata de dominio, rectas, inecuaciones, funciones, gráficos o modelamiento.",
    },
  ]
}

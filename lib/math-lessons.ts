export function lessonForQuestion(question: any) {
  const text = `${question?.pregunta || ""} ${question?.subtema || ""}`.toLowerCase()

  if (text.includes("10+2x") || text.includes("ecuación lineal")) {
    return {
      title: "Resolver ecuación lineal",
      steps: [
        {
          title: "Miramos qué está molestando a la x",
          explanation: "Queremos dejar la x sola. En 10 + 2x = 30, el 10 está sumando al lado izquierdo.",
          equation: "10 + 2x = 30",
          action: "Como el 10 está positivo, lo pasamos restando al otro lado.",
          visual: "move-left",
        },
        {
          title: "Restamos 10 en ambos lados",
          explanation: "No es magia: para mantener la igualdad, hacemos la misma operación a ambos lados.",
          equation: "10 + 2x - 10 = 30 - 10",
          action: "El +10 y el -10 se anulan.",
          visual: "move-left",
        },
        {
          title: "Simplificamos",
          explanation: "Al lado izquierdo queda 2x. Al lado derecho, 30 - 10 = 20.",
          equation: "2x = 20",
          action: "Ahora el 2 está multiplicando a la x.",
          visual: "result",
        },
        {
          title: "Pasamos el 2 dividiendo",
          explanation: "Como 2 está multiplicando a x, usamos la operación contraria: dividir por 2.",
          equation: "2x ÷ 2 = 20 ÷ 2",
          action: "Dividimos ambos lados por 2 para mantener la igualdad.",
          visual: "divide",
        },
        {
          title: "Resultado final",
          explanation: "2x dividido en 2 deja x. 20 dividido en 2 es 10.",
          equation: "x = 10",
          action: "La solución es x = 10.",
          visual: "result",
        },
      ],
    }
  }

  if (text.includes("inecuación") || text.includes("racional") || text.includes("signo")) {
    return {
      title: "Tabla de signos",
      steps: [
        {
          title: "Encontramos puntos críticos",
          explanation: "Buscamos los valores donde la expresión se hace cero o donde no existe. Esos puntos cortan la recta numérica.",
          equation: "puntos críticos: 8 y 17",
          action: "Dividimos la recta en (-∞,8), (8,17), (17,∞).",
          visual: "sign-chart",
        },
        {
          title: "Probamos signos por intervalo",
          explanation: "Tomamos un número dentro de cada intervalo y revisamos si la expresión queda positiva o negativa.",
          equation: "(-∞,8) | (8,17) | (17,∞)",
          action: "No probamos todos los números: basta uno por intervalo.",
          visual: "sign-chart",
        },
        {
          title: "Elegimos lo que pide la desigualdad",
          explanation: "Si la desigualdad pide mayor o igual que cero, elegimos los tramos positivos y revisamos si los extremos se incluyen.",
          equation: "solución: (-∞,8] ∪ [17,∞)",
          action: "Usamos corchete si el extremo se incluye; paréntesis si no se incluye.",
          visual: "result",
        },
      ],
    }
  }

  if (text.includes("factor") || text.includes("factorizar") || text.includes("producto")) {
    return {
      title: "Factorización explicada",
      steps: [
        {
          title: "Buscamos dos números",
          explanation: "Cuando factorizamos x² + bx + c, buscamos dos números que multiplicados den c y sumados den b.",
          equation: "x² + bx + c",
          action: "La multiplicación mira el término final; la suma mira el coeficiente del medio.",
          visual: "factor",
        },
        {
          title: "Ejemplo con 9",
          explanation: "Si necesitamos obtener 9 como producto, revisamos pares como 1·9 o 3·3.",
          equation: "3 · 3 = 9",
          action: "Por eso 3 y 3 pueden servir como factores.",
          visual: "factor",
        },
        {
          title: "Escribimos los factores",
          explanation: "Si ambos números son 3, entonces el trinomio puede escribirse como dos paréntesis.",
          equation: "(x + 3)(x + 3)",
          action: "Factorizar es reescribir una suma como multiplicación.",
          visual: "result",
        },
      ],
    }
  }

  if (text.includes("distancia") || text.includes("puntos")) {
    return {
      title: "Distancia entre puntos",
      steps: [
        {
          title: "Ubicamos los puntos",
          explanation: "Primero identificamos A(x₁,y₁) y B(x₂,y₂). No calculamos todavía: solo miramos el plano.",
          equation: "A(x₁,y₁), B(x₂,y₂)",
          action: "Marca A y B en el gráfico.",
          visual: "move-left",
        },
        {
          title: "Calculamos el cambio en x",
          explanation: "Δx mide cuánto nos movemos horizontalmente. Se calcula como x₂ - x₁.",
          equation: "Δx = x₂ - x₁",
          action: "Dibujamos el movimiento horizontal.",
          visual: "move-left",
        },
        {
          title: "Calculamos el cambio en y",
          explanation: "Δy mide cuánto nos movemos verticalmente. Se calcula como y₂ - y₁.",
          equation: "Δy = y₂ - y₁",
          action: "Dibujamos el movimiento vertical.",
          visual: "move-left",
        },
        {
          title: "Usamos Pitágoras",
          explanation: "La distancia es la hipotenusa del triángulo formado por Δx y Δy.",
          equation: "d = √(Δx² + Δy²)",
          action: "Ahora sí calculamos la distancia.",
          visual: "result",
        },
      ],
    }
  }

  return {
    title: "Explicación guiada",
    steps: [
      {
        title: "Leer el problema",
        explanation: "Primero identificamos qué pregunta y qué datos entrega.",
        equation: question?.pregunta || "",
        action: "Subraya datos y objetivo.",
        visual: "move-left",
      },
      {
        title: "Elegir estrategia",
        explanation: "Seleccionamos la fórmula, propiedad o procedimiento que corresponde al subtema.",
        equation: question?.subtema || "subtema",
        action: "Conecta el ejercicio con el contenido.",
        visual: "factor",
      },
      {
        title: "Resolver con orden",
        explanation: "Desarrollamos paso a paso, evitando saltos algebraicos.",
        equation: question?.respuesta_correcta || "resultado",
        action: "Verifica el resultado final.",
        visual: "result",
      },
    ],
  }
}

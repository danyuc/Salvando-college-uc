export type MathErrorType =
  | "signo"
  | "despeje"
  | "division"
  | "raiz"
  | "distancia"
  | "intervalo"
  | "factorizacion"
  | "respuesta_incompleta"
  | "desconocido"

export type MathErrorAnalysis = {
  type: MathErrorType
  title: string
  message: string
  fix: string
  severity: "baja" | "media" | "alta"
}

function clean(value: any) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("√", "sqrt")
    .replaceAll("raíz", "sqrt")
    .replaceAll("raiz", "sqrt")
    .replace(/\s+/g, "")
    .replace(/[.$]/g, "")
}

function hasAny(text: string, words: string[]) {
  return words.some(w => text.includes(w))
}

export function detectMathError(input: {
  question: any
  selectedAnswer?: string
  writtenAnswer?: string
  correctAnswer?: string
}): MathErrorAnalysis {
  const q = clean(input.question?.pregunta || input.question?.question || "")
  const subtema = clean(input.question?.subtema || "")
  const selected = clean(input.selectedAnswer || input.writtenAnswer || "")
  const correct = clean(input.correctAnswer || input.question?.respuesta_correcta || input.question?.correctAnswer || "")

  if (!selected) {
    return {
      type: "respuesta_incompleta",
      title: "Respuesta incompleta",
      message: "No alcanzaste a entregar una respuesta evaluable.",
      fix: "Escribe al menos el resultado final o selecciona una alternativa antes de avanzar.",
      severity: "media",
    }
  }

  if (selected === correct) {
    return {
      type: "desconocido",
      title: "Sin error detectado",
      message: "La respuesta coincide con la esperada.",
      fix: "Puedes subir dificultad o pasar a un ejercicio con trampa.",
      severity: "baja",
    }
  }

  if (hasAny(q + subtema, ["ecuacion", "ecuación", "despej", "lineal", "x="])) {
    if (
      selected.includes("-") !== correct.includes("-") ||
      selected.includes("+") !== correct.includes("+")
    ) {
      return {
        type: "signo",
        title: "Error de signo",
        message: "Parece que cambiaste mal el signo al mover un término.",
        fix: "Recuerda: si un término está sumando, pasa restando; si está restando, pasa sumando.",
        severity: "alta",
      }
    }

    if (hasAny(selected, ["2x", "3x", "4x", "5x"]) && correct.includes("x=")) {
      return {
        type: "division",
        title: "Faltó dividir por el coeficiente",
        message: "Dejaste la x todavía multiplicada por un número.",
        fix: "Cuando queda 2x = 20, debes dividir ambos lados por 2 para obtener x = 10.",
        severity: "alta",
      }
    }

    return {
      type: "despeje",
      title: "Error de despeje",
      message: "El procedimiento no dejó correctamente la incógnita sola.",
      fix: "Haz una operación inversa por paso y aplícala en ambos lados de la igualdad.",
      severity: "media",
    }
  }

  if (hasAny(q + subtema, ["distancia", "punto", "plano", "coordenada"])) {
    if (selected.includes("32") && correct.includes("52")) {
      return {
        type: "distancia",
        title: "Error en suma de cuadrados",
        message: "Probablemente calculaste mal Δx² + Δy². Por eso te dio √32 en vez de √52.",
        fix: "Revisa Δx y Δy por separado, luego eleva ambos al cuadrado antes de sumar.",
        severity: "alta",
      }
    }

    if (!selected.includes("sqrt") && correct.includes("sqrt")) {
      return {
        type: "raiz",
        title: "Faltó la raíz",
        message: "En distancia no basta sumar cuadrados: al final va raíz cuadrada.",
        fix: "Usa d = √(Δx² + Δy²).",
        severity: "alta",
      }
    }

    return {
      type: "distancia",
      title: "Error en distancia entre puntos",
      message: "El error parece estar en Δx, Δy o en la aplicación de Pitágoras.",
      fix: "Identifica A(x₁,y₁), B(x₂,y₂), calcula Δx y Δy, luego usa la raíz.",
      severity: "media",
    }
  }

  if (hasAny(q + subtema, ["inecu", "intervalo", "signo", "tabla"])) {
    if (
      selected.includes("[") && correct.includes("(") ||
      selected.includes("]") && correct.includes(")")
    ) {
      return {
        type: "intervalo",
        title: "Error con paréntesis y corchetes",
        message: "Incluiste un extremo que probablemente no debía incluirse.",
        fix: "Usa corchete si el punto pertenece a la solución; usa paréntesis si no pertenece o anula el denominador.",
        severity: "alta",
      }
    }

    return {
      type: "intervalo",
      title: "Error en tabla de signos",
      message: "El tramo elegido no coincide con el signo que pide la desigualdad.",
      fix: "Divide la recta por puntos críticos y prueba un número dentro de cada intervalo.",
      severity: "media",
    }
  }

  if (hasAny(q + subtema, ["factor", "trinomio", "producto"])) {
    return {
      type: "factorizacion",
      title: "Error de factorización",
      message: "Los factores elegidos no reconstruyen correctamente la expresión original.",
      fix: "Comprueba multiplicando los paréntesis de vuelta. Debe aparecer el mismo trinomio.",
      severity: "media",
    }
  }

  return {
    type: "desconocido",
    title: "Error no clasificado",
    message: "La respuesta no coincide, pero el sistema no pudo clasificar el patrón exacto.",
    fix: "Revisa signos, operaciones inversas, paréntesis y condiciones del ejercicio.",
    severity: "media",
  }
}

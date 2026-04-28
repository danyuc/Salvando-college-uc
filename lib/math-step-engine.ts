// lib/math-step-engine.ts

export type MathStep = {
  description: string
  expression: string
  highlight?: string[]
}

export type MathSolution = {
  original: string
  steps: MathStep[]
  result: string
  type: 'algebra' | 'quadratic' | 'unknown'
  graph?: {
    type: 'parabola'
    a: number
    b: number
    c: number
    vertex: { x: number; y: number }
  }
}

// 🔥 Detecta tipo de ejercicio
export function detectType(expr: string): MathSolution['type'] {
  if (expr.includes('x^2') || expr.includes('x²')) return 'quadratic'
  if (expr.includes('x')) return 'algebra'
  return 'unknown'
}

// 🔥 Limpia expresión
function normalize(expr: string) {
  return expr
    .replace(/\s+/g, '')
    .replace('²', '^2')
    .replace('--', '+')
}

// 🔥 Extrae coeficientes de ax² + bx + c
function parseQuadratic(expr: string) {
  let a = 0, b = 0, c = 0

  expr = expr.replace('-', '+-')
  const parts = expr.split('+').filter(Boolean)

  for (const p of parts) {
    if (p.includes('x^2')) {
      const val = p.replace('x^2', '')
      a = val === '' ? 1 : val === '-' ? -1 : Number(val)
    } else if (p.includes('x')) {
      const val = p.replace('x', '')
      b = val === '' ? 1 : val === '-' ? -1 : Number(val)
    } else {
      c += Number(p)
    }
  }

  return { a, b, c }
}

// 🔥 Calcula vértice
function getVertex(a: number, b: number, c: number) {
  const x = -b / (2 * a)
  const y = a * x * x + b * x + c
  return { x, y }
}

// 🔥 Motor principal
export function solveExpression(input: string): MathSolution {
  const expr = normalize(input)
  const type = detectType(expr)

  const steps: MathStep[] = []

  // 🟣 CASO: cuadrática
  if (type === 'quadratic') {
    const { a, b, c } = parseQuadratic(expr)

    steps.push({
      description: 'Identificamos los coeficientes de la función cuadrática',
      expression: `a=${a}, b=${b}, c=${c}`,
    })

    const vertex = getVertex(a, b, c)

    steps.push({
      description: 'Calculamos el vértice usando fórmula -b / (2a)',
      expression: `x = ${-b} / (2·${a}) = ${vertex.x}`,
    })

    steps.push({
      description: 'Evaluamos la función en el vértice',
      expression: `y = ${a}(${vertex.x})² + ${b}(${vertex.x}) + ${c} = ${vertex.y}`,
    })

    return {
      original: input,
      steps,
      result: `${a}x² + ${b}x + ${c}`,
      type,
      graph: {
        type: 'parabola',
        a,
        b,
        c,
        vertex,
      },
    }
  }

  // 🟢 CASO: simplificación algebraica
  if (type === 'algebra') {
    const cleaned = expr.replace('-', '+-')
    const parts = cleaned.split('+').filter(Boolean)

    let constant = 0
    let xTerms: string[] = []

    for (const p of parts) {
      if (p.includes('x')) {
        xTerms.push(p)
      } else {
        constant += Number(p)
      }
    }

    steps.push({
      description: 'Separamos términos con x y constantes',
      expression: `Constantes: ${constant}, Variables: ${xTerms.join(', ')}`,
    })

    steps.push({
      description: 'Reducimos términos constantes',
      expression: `${constant}`,
      highlight: parts.filter(p => !p.includes('x')),
    })

    const result = `${constant === 0 ? '' : constant}${xTerms.join('')}`

    return {
      original: input,
      steps,
      result,
      type,
    }
  }

  // 🔴 fallback
  return {
    original: input,
    steps: [{
      description: 'No se pudo identificar el tipo de ejercicio',
      expression: input,
    }],
    result: input,
    type: 'unknown',
  }
}


export type GraphPoint = {
  x: number
  y: number
}

export function evaluatePolynomialExpression(
  expr: string,
  x: number
): number | null {
  try {
    const safe = expr
      .replace(/\s+/g, '')
      .replace(/\^/g, '**')
      .replace(/(\d)(x)/g, '$1*$2')
      .replace(/(x)(\d)/g, '$1*$2')

    const fn = new Function('x', `return ${safe};`)
    const result = fn(x)

    if (typeof result !== 'number' || Number.isNaN(result)) return null
    return result
  } catch {
    return null
  }
}

export function buildGraphPoints(
  expr: string,
  minX = -10,
  maxX = 10,
  step = 0.25
): GraphPoint[] {
  const points: GraphPoint[] = []

  for (let x = minX; x <= maxX; x += step) {
    const y = evaluatePolynomialExpression(expr, Number(x.toFixed(4)))
    if (y !== null && Number.isFinite(y)) {
      points.push({
        x: Number(x.toFixed(4)),
        y: Number(y.toFixed(4)),
      })
    }
  }

  return points
}
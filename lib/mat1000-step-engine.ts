export type Mat1000Step = {
  orden: number
  titulo: string
  explicacion: string
  expresion: string
  accion_visual?: string
  highlight?: string[]
  errores_posibles?: string[]
}

export type Mat1000Animation = {
  paso: number
  tipo: string
  objetivo: string
  descripcion: string
}

export function buildDistanceSteps({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dx2 = dx * dx
  const dy2 = dy * dy
  const rad = dx2 + dy2
  const answer = Number.isInteger(Math.sqrt(rad)) ? String(Math.sqrt(rad)) : `√${rad}`

  const pasos: Mat1000Step[] = [
    {
      orden: 1,
      titulo: "Ubicar los puntos",
      explicacion: `Primero identificamos las coordenadas. El punto A tiene x=${x1}, y=${y1}. El punto B tiene x=${x2}, y=${y2}.`,
      expresion: `A(${x1}, ${y1}),  B(${x2}, ${y2})`,
      accion_visual: "resaltar_puntos",
      highlight: [`A(${x1}, ${y1})`, `B(${x2}, ${y2})`],
      errores_posibles: ["Confundir x con y", "Invertir los puntos"],
    },
    {
      orden: 2,
      titulo: "Calcular el cambio horizontal",
      explicacion: `Ahora calculamos cuánto cambia la coordenada x. Restamos x₂ - x₁. Como x₁=${x1}, queda ${x2} - (${x1}).`,
      expresion: `Δx = x₂ - x₁ = ${x2} - (${x1}) = ${dx}`,
      accion_visual: "dibujar_dx",
      highlight: ["x₂", "x₁", `${dx}`],
      errores_posibles: ["Olvidar que restar un negativo equivale a sumar"],
    },
    {
      orden: 3,
      titulo: "Calcular el cambio vertical",
      explicacion: `Después calculamos cuánto cambia la coordenada y. Restamos y₂ - y₁. Como y₁=${y1}, queda ${y2} - (${y1}).`,
      expresion: `Δy = y₂ - y₁ = ${y2} - (${y1}) = ${dy}`,
      accion_visual: "dibujar_dy",
      highlight: ["y₂", "y₁", `${dy}`],
      errores_posibles: ["Restar al revés", "Perder el signo negativo"],
    },
    {
      orden: 4,
      titulo: "Formar el triángulo rectángulo",
      explicacion: "La distancia AB es la hipotenusa de un triángulo rectángulo cuyos catetos son Δx y Δy.",
      expresion: `d = √[(${dx})² + (${dy})²]`,
      accion_visual: "dibujar_triangulo",
      highlight: [`${dx}`, `${dy}`, "hipotenusa"],
      errores_posibles: ["Sumar catetos directamente sin elevar al cuadrado"],
    },
    {
      orden: 5,
      titulo: "Elevar al cuadrado",
      explicacion: `Elevamos cada diferencia al cuadrado. Aunque Δy sea negativo, al cuadrado queda positivo.`,
      expresion: `d = √(${dx2} + ${dy2})`,
      accion_visual: "simplificar",
      highlight: [`${dx2}`, `${dy2}`],
      errores_posibles: ["Pensar que (-6)² es -36"],
    },
    {
      orden: 6,
      titulo: "Resultado final",
      explicacion: `Sumamos dentro de la raíz: ${dx2}+${dy2}=${rad}. Por eso la distancia es ${answer}.`,
      expresion: `d = ${answer}`,
      accion_visual: "resultado",
      highlight: [answer],
    },
  ]

  const animaciones: Mat1000Animation[] = [
    { paso: 1, tipo: "marcar_punto", objetivo: "A y B", descripcion: "Resalta los dos puntos en el plano." },
    { paso: 2, tipo: "resaltar", objetivo: "Δx", descripcion: "Dibuja el desplazamiento horizontal entre A y B." },
    { paso: 3, tipo: "resaltar", objetivo: "Δy", descripcion: "Dibuja el desplazamiento vertical entre A y B." },
    { paso: 4, tipo: "dibujar_triangulo", objetivo: "Triángulo rectángulo", descripcion: "Construye el triángulo asociado a la distancia." },
    { paso: 5, tipo: "simplificar", objetivo: "Cuadrados", descripcion: "Muestra cómo se elevan las diferencias al cuadrado." },
    { paso: 6, tipo: "resaltar", objetivo: "Resultado", descripcion: "Destaca la distancia final." },
  ]

  return { pasos, animaciones, answer, rad, dx, dy }
}

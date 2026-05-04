export function generateLinearEquation(level: string) {
  let a = Math.floor(Math.random()*10)+1
  let b = Math.floor(Math.random()*20)+1

  if (level === "hard") {
    a = Math.floor(Math.random()*20)+5
    b = Math.floor(Math.random()*50)+10
  }

  return {
    pregunta: `${b} + ${a}x = ${b*2}`,
    respuesta: (b*2 - b) / a,
    subtema: "ecuaciones"
  }
}

export const questions = [
  {
    asignatura: "Precálculo",
    modulo: "modulo_1",
    unidad: "Recta y parábola",
    tema: "Geometría analítica",
    subtema: "Distancia entre puntos",
    evaluaciones: ["I1", "EXAMEN"],
    origen: "prueba_real",
    tipo: "seleccion_multiple",
    dificultad: "media",
    tags: ["geometria"],

    pregunta: "¿Cuál es la distancia entre los puntos A(2, -1) y B(6, 3)?",
    opciones: ["A) 4", "B) 5", "C) √32", "D) 8"],
    respuesta_correcta: "C) √32",

    explanation: "Se usa la fórmula de distancia entre puntos.",

    pasos: [
      {
        orden: 1,
        titulo: "Aplicar fórmula",
        explicacion: "Se usa √[(x2-x1)^2 + (y2-y1)^2]",
        expresion: "√[(6-2)^2 + (3+1)^2]",
      },
      {
        orden: 2,
        titulo: "Simplificar",
        explicacion: "Se calculan las diferencias",
        expresion: "√[(4)^2 + (4)^2] = √(16+16)",
      },
      {
        orden: 3,
        titulo: "Resultado",
        explicacion: "Se obtiene la distancia final",
        expresion: "√32",
      }
    ],

    animaciones: [],
    operacion_visual: [],
    visualizacion: { requiere_visual: false, tipo_visual: "ninguno", parametros: {} },
    deteccion_errores: [],
    adaptatividad: { nivel: "normal", habilidad: "dominio" },

    pista: "Recuerda la fórmula de distancia",
    error_comun: "Olvidar elevar al cuadrado",
    mini_refuerzo: "Practica diferencias de coordenadas"
  },

  {
    asignatura: "Precálculo",
    modulo: "modulo_3",
    unidad: "Funciones",
    tema: "Composición",
    subtema: "Composición de funciones",
    evaluaciones: ["I2", "EXAMEN"],
    origen: "prueba_real",
    tipo: "seleccion_multiple",
    dificultad: "alta",

    pregunta: "Si f(x)=2x+1 y g(x)=x², ¿cuál es f(g(2))?",
    opciones: ["A) 9", "B) 10", "C) 11", "D) 5"],
    respuesta_correcta: "A) 9",

    explanation: "Se reemplaza primero en g y luego en f.",

    pasos: [
      {
        orden: 1,
        titulo: "Evaluar g(2)",
        explicacion: "Se reemplaza en g",
        expresion: "g(2) = 4",
      },
      {
        orden: 2,
        titulo: "Evaluar f(4)",
        explicacion: "Se reemplaza en f",
        expresion: "f(4) = 2(4)+1 = 9",
      }
    ],

    animaciones: [],
    operacion_visual: [],
    visualizacion: { requiere_visual: false, tipo_visual: "ninguno", parametros: {} },
    deteccion_errores: [],
    adaptatividad: { nivel: "desafio", habilidad: "composicion" },

    pista: "Primero función interna",
    error_comun: "Aplicar f antes que g",
    mini_refuerzo: "Recuerda orden de composición"
  }
]

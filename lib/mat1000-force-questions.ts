export function generateMat1000ForceQuestions(input: {
  evaluation?: string
  mode?: string
  moduleLabel?: string
  subtema?: string
  cantidad?: number
}) {
  const evaluation = input.evaluation || "I1"
  const cantidad =
    input.mode === "simulacion" || input.mode === "examen" || input.mode === "interrogacion"
      ? 13
      : Number(input.cantidad || 20)

  const bank = getBank(evaluation, input.subtema)

  return Array.from({ length: cantidad }).map((_, i) => {
    const q = bank[i % bank.length]

    return {
      id: `mat1000-force-${evaluation}-${i}-${Date.now()}`,
      asignatura: "MAT1000",
      modulo: q.modulo,
      unidad: q.unidad,
      tema: q.tema,
      subtema: q.subtema,
      evaluaciones: [evaluation],
      origen: "prueba_real",
      tipo: "seleccion_multiple",
      dificultad: i < 4 ? "media" : "alta",
      pregunta: q.pregunta,
      opciones: q.opciones,
      respuesta_correcta: q.respuesta_correcta,
      explicacion: q.explicacion,
      explanation: q.explicacion,
      respuesta_esperada: null,
      criterios_evaluacion: null,
      nivel_cognitivo: "UC",
      referencia_autor: "MAT1000 UC",
      fuente: "prueba_real",
      error_comun: q.error_comun,
      pista: q.pista,
      mini_refuerzo: q.mini_refuerzo,
      pasos: q.pasos,
      animaciones: [],
      operacion_visual: [],
      visualizacion: (q as any).visualizacion || {
        requiere_visual: false,
        tipo_visual: "ninguno",
        parametros: {},
      },
      deteccion_errores: [],
      adaptatividad: {
        nivel: "normal",
        habilidad: q.subtema,
        si_falla: "Reforzar el subtema con ejercicios más guiados.",
        si_acierta: "Subir dificultad.",
      },
    }
  })
}

function getBank(evaluation: string, selectedSubtema?: string) {
  const all = {
    I1: [
      {
        modulo: "modulo_1",
        unidad: "Recta y parábola",
        tema: "Distancia",
        subtema: "Distancia entre puntos",
        pregunta: "Los puntos A(-3, 4) y B(1, -2) son extremos de un segmento. ¿Cuál es la distancia AB?",
        opciones: ["√28", "√52", "√32", "√60"],
        respuesta_correcta: "√52",
        explicacion: "AB = √[(1 - (-3))² + (-2 - 4)²] = √[4² + (-6)²] = √52.",
        error_comun: "Restar mal las coordenadas o no elevar al cuadrado.",
        pista: "Usa la fórmula de distancia entre dos puntos.",
        mini_refuerzo: "Primero calcula Δx y Δy; luego eleva ambos al cuadrado.",
        pasos: [
          { orden: 1, titulo: "Identificar puntos", explicacion: "A=(-3,4), B=(1,-2).", expresion: "d=√[(x2-x1)^2+(y2-y1)^2]" },
          { orden: 2, titulo: "Sustituir", explicacion: "Reemplazamos coordenadas.", expresion: "√[(1+3)^2+(-2-4)^2]" },
          { orden: 3, titulo: "Calcular", explicacion: "Se simplifica.", expresion: "√(16+36)=√52" },
        ],
        visualizacion: {
          requiere_visual: true,
          tipo_visual: "plano_cartesiano",
          parametros: {
            puntos: [
              { etiqueta: "A", x: -3, y: 4 },
              { etiqueta: "B", x: 1, y: -2 },
            ],
          },
        },
      },
      {
        modulo: "modulo_1",
        unidad: "Recta y parábola",
        tema: "Rectas",
        subtema: "Ecuación de la recta",
        pregunta: "La recta L pasa por los puntos (2, -1) y (5, 5). ¿Cuál es su pendiente?",
        opciones: ["-2", "1/2", "3/2", "2"],
        respuesta_correcta: "2",
        explicacion: "m = (5 - (-1))/(5 - 2) = 6/3 = 2.",
        error_comun: "Invertir la fórmula de pendiente.",
        pista: "Pendiente = cambio en y dividido por cambio en x.",
        mini_refuerzo: "Ordena bien los puntos antes de restar.",
        pasos: [
          { orden: 1, titulo: "Fórmula", explicacion: "Usamos m=(y2-y1)/(x2-x1).", expresion: "m=(5-(-1))/(5-2)" },
          { orden: 2, titulo: "Simplificar", explicacion: "Calculamos numerador y denominador.", expresion: "m=6/3=2" },
        ],
      },
      {
        modulo: "modulo_1",
        unidad: "Recta y parábola",
        tema: "Parábola",
        subtema: "Parábola y modelos cuadráticos",
        pregunta: "¿Cuál es el vértice de la parábola y = -2(x - 3)^2 + 8?",
        opciones: ["(3, -8)", "(3, 8)", "(-3, 8)", "(2, 8)"],
        respuesta_correcta: "(3, 8)",
        explicacion: "La forma y=a(x-h)^2+k tiene vértice (h,k). Aquí h=3 y k=8.",
        error_comun: "Cambiar el signo de h.",
        pista: "Mira la forma canónica.",
        mini_refuerzo: "En (x-h), el vértice usa h positivo.",
        pasos: [
          { orden: 1, titulo: "Forma canónica", explicacion: "y=a(x-h)^2+k.", expresion: "y=-2(x-3)^2+8" },
          { orden: 2, titulo: "Leer vértice", explicacion: "h=3, k=8.", expresion: "V=(3,8)" },
        ],
      },
      {
        modulo: "modulo_2",
        unidad: "Inecuaciones",
        tema: "Inecuaciones",
        subtema: "Inecuaciones cuadráticas",
        pregunta: "¿Cuál es el conjunto solución de x² - x - 6 ≤ 0?",
        opciones: ["(-∞, -2]", "[3, ∞)", "(-∞, -2] ∪ [3, ∞)", "[-2, 3]"],
        respuesta_correcta: "[-2, 3]",
        explicacion: "x²-x-6=(x-3)(x+2). Como la parábola abre hacia arriba, es ≤0 entre las raíces.",
        error_comun: "Elegir los intervalos exteriores.",
        pista: "Factoriza y analiza el signo.",
        mini_refuerzo: "Para una parábola que abre hacia arriba, la zona negativa queda entre raíces.",
        pasos: [
          { orden: 1, titulo: "Factorizar", explicacion: "Buscamos dos números que multipliquen -6 y sumen -1.", expresion: "(x-3)(x+2)≤0" },
          { orden: 2, titulo: "Raíces", explicacion: "Los puntos críticos son -2 y 3.", expresion: "x=-2, x=3" },
          { orden: 3, titulo: "Intervalo", explicacion: "Se toma el intervalo donde el producto es negativo o cero.", expresion: "[-2,3]" },
        ],
      },
      {
        modulo: "modulo_2",
        unidad: "Inecuaciones",
        tema: "Valor absoluto",
        subtema: "Valor absoluto",
        pregunta: "¿Cuál es el conjunto solución de |2x - 3| ≤ 7?",
        opciones: ["(-∞, -2] ∪ [5, ∞)", "[-2, 5]", "(-2, 5)", "[-5, 2]"],
        respuesta_correcta: "[-2, 5]",
        explicacion: "|2x-3|≤7 equivale a -7≤2x-3≤7. Entonces -4≤2x≤10, por lo tanto -2≤x≤5.",
        error_comun: "Resolver solo un caso.",
        pista: "Transforma el valor absoluto en doble desigualdad.",
        mini_refuerzo: "Para |A|≤k se usa -k≤A≤k.",
        pasos: [
          { orden: 1, titulo: "Doble desigualdad", explicacion: "Como es menor o igual.", expresion: "-7≤2x-3≤7" },
          { orden: 2, titulo: "Despejar", explicacion: "Sumamos 3 y dividimos por 2.", expresion: "-2≤x≤5" },
        ],
      },
    ],
    I2: [
      {
        modulo: "modulo_3",
        unidad: "Funciones reales",
        tema: "Dominio",
        subtema: "Dominio",
        pregunta: "¿Cuál es el dominio de f(x)=√(5-|8-x|)?",
        opciones: ["(3,13)", "[3,13]", "[-13,-3]", "No se puede determinar"],
        respuesta_correcta: "[3,13]",
        explicacion: "Para que exista la raíz: 5-|8-x|≥0, entonces |8-x|≤5, por lo que 3≤x≤13.",
        error_comun: "Olvidar que el radicando debe ser no negativo.",
        pista: "Impón radicando ≥ 0.",
        mini_refuerzo: "Toda raíz par exige cantidad interior mayor o igual a cero.",
        pasos: [
          { orden: 1, titulo: "Condición", explicacion: "El radicando debe ser no negativo.", expresion: "5-|8-x|≥0" },
          { orden: 2, titulo: "Valor absoluto", explicacion: "Equivale a |8-x|≤5.", expresion: "-5≤8-x≤5" },
          { orden: 3, titulo: "Intervalo", explicacion: "Se despeja x.", expresion: "3≤x≤13" },
        ],
      },
      {
        modulo: "modulo_3",
        unidad: "Funciones reales",
        tema: "Composición",
        subtema: "Composición de funciones",
        pregunta: "Si f(x)=x²+1 y g(x)=(x-3)/x, ¿cuál corresponde a f(g(x))?",
        opciones: ["((x-3)/x)²+1", "x²-2/x²+1", "x²-8/x²", "x²+1"],
        respuesta_correcta: "((x-3)/x)²+1",
        explicacion: "Se reemplaza la entrada de f por g(x): f(g(x))=(g(x))²+1=((x-3)/x)²+1.",
        error_comun: "Sumar funciones en vez de componer.",
        pista: "En f(x), cambia cada x por g(x).",
        mini_refuerzo: "Componer es sustituir, no multiplicar.",
        pasos: [
          { orden: 1, titulo: "Función externa", explicacion: "f(u)=u²+1.", expresion: "f(g(x))=(g(x))²+1" },
          { orden: 2, titulo: "Sustituir", explicacion: "g(x)=(x-3)/x.", expresion: "((x-3)/x)²+1" },
        ],
      },
    ],
    I3: [
      {
        modulo: "modulo_5",
        unidad: "Trigonometría",
        tema: "Razones trigonométricas",
        subtema: "Razones trigonométricas",
        pregunta: "Si t está en el tercer cuadrante y sen(t)=-12/13, ¿cuál es tan(t)?",
        opciones: ["12/5", "5/12", "12/13", "-12/13"],
        respuesta_correcta: "12/5",
        explicacion: "En el tercer cuadrante seno y coseno son negativos, por lo que tangente es positiva. Con triángulo 5-12-13, cos(t)=-5/13 y tan(t)=(-12/13)/(-5/13)=12/5.",
        error_comun: "Olvidar el signo por cuadrante.",
        pista: "En QIII, tangente es positiva.",
        mini_refuerzo: "Usa identidad sen²+cos²=1.",
        pasos: [
          { orden: 1, titulo: "Cuadrante", explicacion: "En QIII, seno y coseno son negativos.", expresion: "sen(t)<0, cos(t)<0" },
          { orden: 2, titulo: "Triángulo", explicacion: "Si sen=-12/13, entonces cos=-5/13.", expresion: "cos(t)=-5/13" },
          { orden: 3, titulo: "Tangente", explicacion: "tan=sen/cos.", expresion: "tan(t)=12/5" },
        ],
      },
    ],
    EXAMEN: [
      {
        modulo: "modulo_6",
        unidad: "Polinomios",
        tema: "Teorema del resto",
        subtema: "Polinomios",
        pregunta: "¿Cuál es el resto al dividir P(x)=x^2019-3x^1000+x²-1 entre x-1?",
        opciones: ["2", "-4", "4", "-2"],
        respuesta_correcta: "-2",
        explicacion: "Por teorema del resto, el resto es P(1)=1-3+1-1=-2.",
        error_comun: "Intentar dividir el polinomio completo.",
        pista: "Usa el teorema del resto.",
        mini_refuerzo: "Al dividir por x-a, el resto es P(a).",
        pasos: [
          { orden: 1, titulo: "Teorema del resto", explicacion: "Para x-1, evaluamos en x=1.", expresion: "P(1)" },
          { orden: 2, titulo: "Calcular", explicacion: "Sustituimos.", expresion: "1-3+1-1=-2" },
        ],
      },
    ],
  } as const

  const key = evaluation === "I2" || evaluation === "I3" || evaluation === "EXAMEN" ? evaluation : "I1"
  const list = [...all[key]]

  if (!selectedSubtema || selectedSubtema === "Todos") return list

  const filtered = list.filter(q => q.subtema === selectedSubtema)
  return filtered.length ? filtered : list
}

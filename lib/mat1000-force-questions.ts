import { buildDistanceSteps } from './mat1000-step-engine'

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

  const focusedBank = getBank(evaluation, input.subtema)
  const fullBank = getBank(evaluation)
  const bank = focusedBank.length >= Math.min(cantidad, 8)
    ? focusedBank
    : [...focusedBank, ...fullBank.filter((q: any) => !focusedBank.some((f: any) => f.pregunta === q.pregunta))]

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
      pasos: q.subtema === "Distancia entre puntos" && typeof (q as any).visualizacion?.parametros?.puntos?.[0]?.x === "number"
        ? buildDistanceSteps({
            x1: (q as any).visualizacion.parametros.puntos[0].x,
            y1: (q as any).visualizacion.parametros.puntos[0].y,
            x2: (q as any).visualizacion.parametros.puntos[1].x,
            y2: (q as any).visualizacion.parametros.puntos[1].y,
          }).pasos
        : q.pasos,
      animaciones: q.subtema === "Distancia entre puntos" && typeof (q as any).visualizacion?.parametros?.puntos?.[0]?.x === "number"
        ? buildDistanceSteps({
            x1: (q as any).visualizacion.parametros.puntos[0].x,
            y1: (q as any).visualizacion.parametros.puntos[0].y,
            x2: (q as any).visualizacion.parametros.puntos[1].x,
            y2: (q as any).visualizacion.parametros.puntos[1].y,
          }).animaciones
        : [],
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
        si_falla: "Reforzar el subtema con ejercicios mÃ¡s guiados.",
        si_acierta: "Subir dificultad.",
      },
    }
  })
}

function expandMat1000Bank(evaluation: string, bank: any[]) {
  if (evaluation !== "I3") return bank;

  const ratioVariants = [
    {
      pregunta: "Si t está en el tercer cuadrante y sen(t)=-12/13, ¿cuál es tan(t)?",
      opciones: ["12/5", "5/12", "-12/5", "-5/12"],
      respuesta_correcta: "12/5",
      explicacion: "En QIII, seno y coseno son negativos, por eso tangente es positiva. Con sen(t)=-12/13, el triángulo es 5-12-13 y cos(t)=-5/13. Entonces tan(t)=(-12/13)/(-5/13)=12/5.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QIII implica sen<0, cos<0 y tan>0.", expresion: "QIII → tan positiva" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 12/13 aparece el cateto 5.", expresion: "5-12-13" },
        { orden: 3, titulo: "Coseno", explicacion: "En QIII el coseno es negativo.", expresion: "cos(t)=-5/13" },
        { orden: 4, titulo: "Tangente", explicacion: "tan=sen/cos.", expresion: "tan(t)=12/5" }
      ]
    },
    {
      pregunta: "Si t está en el segundo cuadrante y sen(t)=4/5, ¿cuál es tan(t)?",
      opciones: ["4/3", "-4/3", "3/4", "-3/4"],
      respuesta_correcta: "-4/3",
      explicacion: "En QII, seno positivo y coseno negativo. Con triángulo 3-4-5, cos(t)=-3/5. Entonces tan(t)=(4/5)/(-3/5)=-4/3.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QII implica sen>0, cos<0 y tan<0.", expresion: "QII → tan negativa" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 4/5 aparece el cateto 3.", expresion: "3-4-5" },
        { orden: 3, titulo: "Coseno", explicacion: "En QII el coseno es negativo.", expresion: "cos(t)=-3/5" },
        { orden: 4, titulo: "Tangente", explicacion: "tan=sen/cos.", expresion: "tan(t)=-4/3" }
      ]
    },
    {
      pregunta: "Si t está en el cuarto cuadrante y sen(t)=-3/5, ¿cuál es tan(t)?",
      opciones: ["3/4", "-3/4", "4/3", "-4/3"],
      respuesta_correcta: "-3/4",
      explicacion: "En QIV, seno negativo y coseno positivo. Con triángulo 3-4-5, cos(t)=4/5. Entonces tan(t)=(-3/5)/(4/5)=-3/4.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QIV implica sen<0, cos>0 y tan<0.", expresion: "QIV → tan negativa" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 3/5 aparece el cateto 4.", expresion: "3-4-5" },
        { orden: 3, titulo: "Coseno", explicacion: "En QIV el coseno es positivo.", expresion: "cos(t)=4/5" },
        { orden: 4, titulo: "Tangente", explicacion: "tan=sen/cos.", expresion: "tan(t)=-3/4" }
      ]
    },
    {
      pregunta: "Si t está en el primer cuadrante y sen(t)=5/13, ¿cuál es tan(t)?",
      opciones: ["5/12", "12/5", "-5/12", "-12/5"],
      respuesta_correcta: "5/12",
      explicacion: "En QI todo es positivo. Con sen(t)=5/13, cos(t)=12/13. Entonces tan(t)=(5/13)/(12/13)=5/12.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QI implica todo positivo.", expresion: "QI → tan positiva" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 5/13 aparece el cateto 12.", expresion: "5-12-13" },
        { orden: 3, titulo: "Coseno", explicacion: "En QI el coseno es positivo.", expresion: "cos(t)=12/13" },
        { orden: 4, titulo: "Tangente", explicacion: "tan=sen/cos.", expresion: "tan(t)=5/12" }
      ]
    },
    {
      pregunta: "Si t está en el tercer cuadrante y cos(t)=-8/17, ¿cuál es tan(t)?",
      opciones: ["15/8", "8/15", "-15/8", "-8/15"],
      respuesta_correcta: "15/8",
      explicacion: "En QIII, seno y coseno son negativos. Con cos(t)=-8/17, sen(t)=-15/17. Entonces tan(t)=(-15/17)/(-8/17)=15/8.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QIII implica tan positiva.", expresion: "sen<0, cos<0" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 8/17 aparece el cateto 15.", expresion: "8-15-17" },
        { orden: 3, titulo: "Seno", explicacion: "En QIII el seno es negativo.", expresion: "sen(t)=-15/17" },
        { orden: 4, titulo: "Tangente", explicacion: "tan=sen/cos.", expresion: "tan(t)=15/8" }
      ]
    },
    {
      pregunta: "Si t está en el segundo cuadrante y cos(t)=-5/13, ¿cuál es sen(t)?",
      opciones: ["12/13", "-12/13", "5/12", "-5/12"],
      respuesta_correcta: "12/13",
      explicacion: "En QII, seno positivo y coseno negativo. Con cos(t)=-5/13, el otro cateto es 12, por eso sen(t)=12/13.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QII implica sen positivo.", expresion: "sen>0" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 5/13 aparece 12.", expresion: "5-12-13" },
        { orden: 3, titulo: "Resultado", explicacion: "El seno es positivo en QII.", expresion: "sen(t)=12/13" }
      ]
    },
    {
      pregunta: "Si t está en el cuarto cuadrante y cos(t)=12/13, ¿cuál es sen(t)?",
      opciones: ["5/13", "-5/13", "12/5", "-12/5"],
      respuesta_correcta: "-5/13",
      explicacion: "En QIV, coseno positivo y seno negativo. Con cos(t)=12/13, el otro cateto es 5, por eso sen(t)=-5/13.",
      pasos: [
        { orden: 1, titulo: "Cuadrante", explicacion: "QIV implica sen negativo.", expresion: "sen<0" },
        { orden: 2, titulo: "Triángulo", explicacion: "Con 12/13 aparece 5.", expresion: "5-12-13" },
        { orden: 3, titulo: "Resultado", explicacion: "El seno es negativo en QIV.", expresion: "sen(t)=-5/13" }
      ]
    },
    {
      pregunta: "Si t está en el segundo cuadrante y tan(t)=-4/3, ¿cuál puede ser sen(t)?",
      opciones: ["4/5", "-4/5", "3/5", "-3/5"],
      respuesta_correcta: "4/5",
      explicacion: "tan=-4/3 indica catetos 4 y 3. En QII el seno es positivo y la hipotenusa es 5, por eso sen(t)=4/5.",
      pasos: [
        { orden: 1, titulo: "Tangente", explicacion: "La tangente relaciona opuesto/adyacente.", expresion: "tan=-4/3" },
        { orden: 2, titulo: "Hipotenusa", explicacion: "Triángulo 3-4-5.", expresion: "h=5" },
        { orden: 3, titulo: "Signo", explicacion: "En QII el seno es positivo.", expresion: "sen(t)=4/5" }
      ]
    },
    {
      pregunta: "Si t está en el tercer cuadrante y tan(t)=15/8, ¿cuál puede ser cos(t)?",
      opciones: ["8/17", "-8/17", "15/17", "-15/17"],
      respuesta_correcta: "-8/17",
      explicacion: "tan=15/8 usa triángulo 8-15-17. En QIII el coseno es negativo, por eso cos(t)=-8/17.",
      pasos: [
        { orden: 1, titulo: "Tangente", explicacion: "tan=opuesto/adyacente.", expresion: "15/8" },
        { orden: 2, titulo: "Triángulo", explicacion: "La hipotenusa es 17.", expresion: "8-15-17" },
        { orden: 3, titulo: "Signo", explicacion: "En QIII coseno es negativo.", expresion: "cos(t)=-8/17" }
      ]
    },
    {
      pregunta: "En el círculo unitario, ¿cuál es sen(π/2)?",
      opciones: ["0", "1", "-1", "π/2"],
      respuesta_correcta: "1",
      explicacion: "En π/2 el punto del círculo unitario es (0,1). El seno corresponde a la coordenada y, por eso sen(π/2)=1.",
      pasos: [
        { orden: 1, titulo: "Punto", explicacion: "En π/2 el punto es arriba.", expresion: "(0,1)" },
        { orden: 2, titulo: "Seno", explicacion: "Seno es coordenada y.", expresion: "sen(π/2)=1" }
      ]
    },
    {
      pregunta: "En el círculo unitario, ¿cuál es cos(π)?",
      opciones: ["1", "0", "-1", "π"],
      respuesta_correcta: "-1",
      explicacion: "En π el punto del círculo unitario es (-1,0). El coseno corresponde a la coordenada x, por eso cos(π)=-1.",
      pasos: [
        { orden: 1, titulo: "Punto", explicacion: "En π el punto está a la izquierda.", expresion: "(-1,0)" },
        { orden: 2, titulo: "Coseno", explicacion: "Coseno es coordenada x.", expresion: "cos(π)=-1" }
      ]
    },
    {
      pregunta: "Convierte 180° a radianes.",
      opciones: ["π", "2π", "π/2", "3π/2"],
      respuesta_correcta: "π",
      explicacion: "La equivalencia base es 180°=π radianes.",
      pasos: [
        { orden: 1, titulo: "Equivalencia", explicacion: "180° equivale a π rad.", expresion: "180° = π" }
      ]
    },
    {
      pregunta: "Convierte 90° a radianes.",
      opciones: ["π", "π/2", "2π", "3π/2"],
      respuesta_correcta: "π/2",
      explicacion: "Como 180°=π, entonces 90° es la mitad: π/2.",
      pasos: [
        { orden: 1, titulo: "Equivalencia", explicacion: "90° es la mitad de 180°.", expresion: "π/2" }
      ]
    },
    {
      pregunta: "Para y=3sen(2x), ¿cuál es la amplitud y el periodo?",
      opciones: ["3 y π", "2 y 3π", "3 y 2π", "2 y π"],
      respuesta_correcta: "3 y π",
      explicacion: "La amplitud es |3|=3. El periodo es 2π/2=π.",
      pasos: [
        { orden: 1, titulo: "Amplitud", explicacion: "El número de afuera es A=3.", expresion: "amplitud=3" },
        { orden: 2, titulo: "Periodo", explicacion: "El número que multiplica x es k=2.", expresion: "periodo=2π/2=π" }
      ]
    },
    {
      pregunta: "Para y=2cos(4x), ¿cuál es el periodo?",
      opciones: ["2π", "π", "π/2", "4π"],
      respuesta_correcta: "π/2",
      explicacion: "En y=Acos(kx), el periodo es 2π/|k|. Aquí k=4, entonces periodo=2π/4=π/2.",
      pasos: [
        { orden: 1, titulo: "Identificar k", explicacion: "k=4.", expresion: "cos(4x)" },
        { orden: 2, titulo: "Periodo", explicacion: "2π/4=π/2.", expresion: "periodo=π/2" }
      ]
    },
    {
      pregunta: "Para y=-5sen(x), ¿cuál es la amplitud?",
      opciones: ["-5", "5", "π", "2π"],
      respuesta_correcta: "5",
      explicacion: "La amplitud siempre es positiva y se calcula como |A|. Aquí A=-5, entonces amplitud=5.",
      pasos: [
        { orden: 1, titulo: "Identificar A", explicacion: "A=-5.", expresion: "y=-5sen(x)" },
        { orden: 2, titulo: "Valor absoluto", explicacion: "La amplitud es |A|.", expresion: "|-5|=5" }
      ]
    },
    {
      pregunta: "En y=sen(x-π/3), ¿cuál es el desfase?",
      opciones: ["π/3 a la derecha", "π/3 a la izquierda", "π a la derecha", "Sin desfase"],
      respuesta_correcta: "π/3 a la derecha",
      explicacion: "La forma y=sen(x-b) desplaza la gráfica b unidades hacia la derecha. Aquí b=π/3.",
      pasos: [
        { orden: 1, titulo: "Forma", explicacion: "y=sen(x-b).", expresion: "b=π/3" },
        { orden: 2, titulo: "Dirección", explicacion: "x-b mueve hacia la derecha.", expresion: "π/3 a la derecha" }
      ]
    },
    {
      pregunta: "¿Cuál identidad es siempre verdadera?",
      opciones: ["sen²(t)+cos²(t)=1", "sen(t)+cos(t)=1", "tan(t)=cos(t)/sen(t)", "cos²(t)-sen²(t)=1 siempre"],
      respuesta_correcta: "sen²(t)+cos²(t)=1",
      explicacion: "La identidad pitagórica fundamental es sen²(t)+cos²(t)=1.",
      pasos: [
        { orden: 1, titulo: "Identidad base", explicacion: "Viene del círculo unitario.", expresion: "x²+y²=1" },
        { orden: 2, titulo: "Trigonometría", explicacion: "x=cos(t), y=sen(t).", expresion: "sen²(t)+cos²(t)=1" }
      ]
    },
    {
      pregunta: "Si sen(t)=0, ¿cuál puede ser un valor de t?",
      opciones: ["0", "π/2", "π/3", "π/4"],
      respuesta_correcta: "0",
      explicacion: "En t=0, el punto del círculo unitario es (1,0), por eso el seno vale 0.",
      pasos: [
        { orden: 1, titulo: "Punto", explicacion: "En 0 radianes estamos en (1,0).", expresion: "sen(0)=0" }
      ]
    },
    {
      pregunta: "Si cos(t)=0, ¿cuál puede ser un valor de t?",
      opciones: ["0", "π/2", "π", "2π"],
      respuesta_correcta: "π/2",
      explicacion: "En π/2 el punto del círculo unitario es (0,1), por eso el coseno vale 0.",
      pasos: [
        { orden: 1, titulo: "Punto", explicacion: "En π/2 la coordenada x es 0.", expresion: "cos(π/2)=0" }
      ]
    }
  ];

  const variants = ratioVariants.map((q, i) => ({
    modulo: "modulo_5",
    unidad: "Trigonometría",
    tema: "Razones trigonométricas",
    subtema: "Razones trigonométricas",
    dificultad: i < 8 ? "media" : "alta",
    error_comun: "Error típico: olvidar el signo del cuadrante o confundir seno con coseno.",
    pista: "Primero decide el signo por cuadrante; después calcula.",
    mini_refuerzo: "Recuerda: tan(t)=sen(t)/cos(t).",
    visualizacion: { requiere_visual: true, tipo_visual: "circulo_unitario", parametros: {} },
    ...q,
  }));

  return [...bank, ...variants.filter((v: any) => !bank.some((q: any) => q.pregunta === v.pregunta))];
}

function getBank(evaluation: string, selectedSubtema?: string) {
  const all = {
    I1: [
      {
        modulo: "modulo_1",
        unidad: "Recta y parÃ¡bola",
        tema: "Distancia",
        subtema: "Distancia entre puntos",
        pregunta: "Los puntos A(-3, 4) y B(1, -2) son extremos de un segmento. Â¿CuÃ¡l es la distancia AB?",
        opciones: ["âˆš28", "âˆš52", "âˆš32", "âˆš60"],
        respuesta_correcta: "âˆš52",
        explicacion: "AB = âˆš[(1 - (-3))Â² + (-2 - 4)Â²] = âˆš[4Â² + (-6)Â²] = âˆš52.",
        error_comun: "Restar mal las coordenadas o no elevar al cuadrado.",
        pista: "Usa la fÃ³rmula de distancia entre dos puntos.",
        mini_refuerzo: "Primero calcula Î”x y Î”y; luego eleva ambos al cuadrado.",
        pasos: [
          { orden: 1, titulo: "Identificar puntos", explicacion: "A=(-3,4), B=(1,-2).", expresion: "d=âˆš[(x2-x1)^2+(y2-y1)^2]" },
          { orden: 2, titulo: "Sustituir", explicacion: "Reemplazamos coordenadas.", expresion: "âˆš[(1+3)^2+(-2-4)^2]" },
          { orden: 3, titulo: "Calcular", explicacion: "Se simplifica.", expresion: "âˆš(16+36)=âˆš52" },
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
        unidad: "Recta y parÃ¡bola",
        tema: "Rectas",
        subtema: "EcuaciÃ³n de la recta",
        pregunta: "La recta L pasa por los puntos (2, -1) y (5, 5). Â¿CuÃ¡l es su pendiente?",
        opciones: ["-2", "1/2", "3/2", "2"],
        respuesta_correcta: "2",
        explicacion: "m = (5 - (-1))/(5 - 2) = 6/3 = 2.",
        error_comun: "Invertir la fÃ³rmula de pendiente.",
        pista: "Pendiente = cambio en y dividido por cambio en x.",
        mini_refuerzo: "Ordena bien los puntos antes de restar.",
        pasos: [
          { orden: 1, titulo: "FÃ³rmula", explicacion: "Usamos m=(y2-y1)/(x2-x1).", expresion: "m=(5-(-1))/(5-2)" },
          { orden: 2, titulo: "Simplificar", explicacion: "Calculamos numerador y denominador.", expresion: "m=6/3=2" },
        ],
      },
      {
        modulo: "modulo_1",
        unidad: "Recta y parÃ¡bola",
        tema: "ParÃ¡bola",
        subtema: "ParÃ¡bola y modelos cuadrÃ¡ticos",
        pregunta: "Â¿CuÃ¡l es el vÃ©rtice de la parÃ¡bola y = -2(x - 3)^2 + 8?",
        opciones: ["(3, -8)", "(3, 8)", "(-3, 8)", "(2, 8)"],
        respuesta_correcta: "(3, 8)",
        explicacion: "La forma y=a(x-h)^2+k tiene vÃ©rtice (h,k). AquÃ­ h=3 y k=8.",
        error_comun: "Cambiar el signo de h.",
        pista: "Mira la forma canÃ³nica.",
        mini_refuerzo: "En (x-h), el vÃ©rtice usa h positivo.",
        pasos: [
          { orden: 1, titulo: "Forma canÃ³nica", explicacion: "y=a(x-h)^2+k.", expresion: "y=-2(x-3)^2+8" },
          { orden: 2, titulo: "Leer vÃ©rtice", explicacion: "h=3, k=8.", expresion: "V=(3,8)" },
        ],
      },
      {
        modulo: "modulo_2",
        unidad: "Inecuaciones",
        tema: "Inecuaciones",
        subtema: "Inecuaciones cuadrÃ¡ticas",
        pregunta: "Â¿CuÃ¡l es el conjunto soluciÃ³n de xÂ² - x - 6 â‰¤ 0?",
        opciones: ["(-âˆž, -2]", "[3, âˆž)", "(-âˆž, -2] âˆª [3, âˆž)", "[-2, 3]"],
        respuesta_correcta: "[-2, 3]",
        explicacion: "xÂ²-x-6=(x-3)(x+2). Como la parÃ¡bola abre hacia arriba, es â‰¤0 entre las raÃ­ces.",
        error_comun: "Elegir los intervalos exteriores.",
        pista: "Factoriza y analiza el signo.",
        mini_refuerzo: "Para una parÃ¡bola que abre hacia arriba, la zona negativa queda entre raÃ­ces.",
        pasos: [
          { orden: 1, titulo: "Factorizar", explicacion: "Buscamos dos nÃºmeros que multipliquen -6 y sumen -1.", expresion: "(x-3)(x+2)â‰¤0" },
          { orden: 2, titulo: "RaÃ­ces", explicacion: "Los puntos crÃ­ticos son -2 y 3.", expresion: "x=-2, x=3" },
          { orden: 3, titulo: "Intervalo", explicacion: "Se toma el intervalo donde el producto es negativo o cero.", expresion: "[-2,3]" },
        ],
      },
      {
        modulo: "modulo_2",
        unidad: "Inecuaciones",
        tema: "Valor absoluto",
        subtema: "Valor absoluto",
        pregunta: "Â¿CuÃ¡l es el conjunto soluciÃ³n de |2x - 3| â‰¤ 7?",
        opciones: ["(-âˆž, -2] âˆª [5, âˆž)", "[-2, 5]", "(-2, 5)", "[-5, 2]"],
        respuesta_correcta: "[-2, 5]",
        explicacion: "|2x-3|â‰¤7 equivale a -7â‰¤2x-3â‰¤7. Entonces -4â‰¤2xâ‰¤10, por lo tanto -2â‰¤xâ‰¤5.",
        error_comun: "Resolver solo un caso.",
        pista: "Transforma el valor absoluto en doble desigualdad.",
        mini_refuerzo: "Para |A|â‰¤k se usa -kâ‰¤Aâ‰¤k.",
        pasos: [
          { orden: 1, titulo: "Doble desigualdad", explicacion: "Como es menor o igual.", expresion: "-7â‰¤2x-3â‰¤7" },
          { orden: 2, titulo: "Despejar", explicacion: "Sumamos 3 y dividimos por 2.", expresion: "-2â‰¤xâ‰¤5" },
        ],
      },
    ],
    I2: [
      {
        modulo: "modulo_3",
        unidad: "Funciones reales",
        tema: "Dominio",
        subtema: "Dominio",
        pregunta: "Â¿CuÃ¡l es el dominio de f(x)=âˆš(5-|8-x|)?",
        opciones: ["(3,13)", "[3,13]", "[-13,-3]", "No se puede determinar"],
        respuesta_correcta: "[3,13]",
        explicacion: "Para que exista la raÃ­z: 5-|8-x|â‰¥0, entonces |8-x|â‰¤5, por lo que 3â‰¤xâ‰¤13.",
        error_comun: "Olvidar que el radicando debe ser no negativo.",
        pista: "ImpÃ³n radicando â‰¥ 0.",
        mini_refuerzo: "Toda raÃ­z par exige cantidad interior mayor o igual a cero.",
        pasos: [
          { orden: 1, titulo: "CondiciÃ³n", explicacion: "El radicando debe ser no negativo.", expresion: "5-|8-x|â‰¥0" },
          { orden: 2, titulo: "Valor absoluto", explicacion: "Equivale a |8-x|â‰¤5.", expresion: "-5â‰¤8-xâ‰¤5" },
          { orden: 3, titulo: "Intervalo", explicacion: "Se despeja x.", expresion: "3â‰¤xâ‰¤13" },
        ],
      },
      {
        modulo: "modulo_3",
        unidad: "Funciones reales",
        tema: "ComposiciÃ³n",
        subtema: "ComposiciÃ³n de funciones",
        pregunta: "Si f(x)=xÂ²+1 y g(x)=(x-3)/x, Â¿cuÃ¡l corresponde a f(g(x))?",
        opciones: ["((x-3)/x)Â²+1", "xÂ²-2/xÂ²+1", "xÂ²-8/xÂ²", "xÂ²+1"],
        respuesta_correcta: "((x-3)/x)Â²+1",
        explicacion: "Se reemplaza la entrada de f por g(x): f(g(x))=(g(x))Â²+1=((x-3)/x)Â²+1.",
        error_comun: "Sumar funciones en vez de componer.",
        pista: "En f(x), cambia cada x por g(x).",
        mini_refuerzo: "Componer es sustituir, no multiplicar.",
        pasos: [
          { orden: 1, titulo: "FunciÃ³n externa", explicacion: "f(u)=uÂ²+1.", expresion: "f(g(x))=(g(x))Â²+1" },
          { orden: 2, titulo: "Sustituir", explicacion: "g(x)=(x-3)/x.", expresion: "((x-3)/x)Â²+1" },
        ],
      },
    ],
    I3: [
      {
        modulo: "modulo_5",
        unidad: "TrigonometrÃ­a",
        tema: "Razones trigonomÃ©tricas",
        subtema: "Razones trigonomÃ©tricas",
        pregunta: "Si t estÃ¡ en el tercer cuadrante y sen(t)=-12/13, Â¿cuÃ¡l es tan(t)?",
        opciones: ["12/5", "5/12", "12/13", "-12/13"],
        respuesta_correcta: "12/5",
        explicacion: "En el tercer cuadrante seno y coseno son negativos, por lo que tangente es positiva. Con triÃ¡ngulo 5-12-13, cos(t)=-5/13 y tan(t)=(-12/13)/(-5/13)=12/5.",
        error_comun: "Olvidar el signo por cuadrante.",
        pista: "En QIII, tangente es positiva.",
        mini_refuerzo: "Usa identidad senÂ²+cosÂ²=1.",
        pasos: [
          { orden: 1, titulo: "Cuadrante", explicacion: "En QIII, seno y coseno son negativos.", expresion: "sen(t)<0, cos(t)<0" },
          { orden: 2, titulo: "TriÃ¡ngulo", explicacion: "Si sen=-12/13, entonces cos=-5/13.", expresion: "cos(t)=-5/13" },
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
        pregunta: "Â¿CuÃ¡l es el resto al dividir P(x)=x^2019-3x^1000+xÂ²-1 entre x-1?",
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


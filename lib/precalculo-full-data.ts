export type PrecalculoExamId = "i1" | "i2" | "i3" | "examen";

export type SolvedExample = {
  title: string;
  statement: string;
  steps: string[];
  final: string;
};

export type PrecalculoTopic = {
  id: string;
  title: string;
  theme: string;
  why: string;
  ucFocus: string;
  skills: string[];
  formulas: string[];
  proMaxTips: string[];
  commonMistakes: string[];
  solvedExamples: SolvedExample[];
};

export type PrecalculoExam = {
  id: PrecalculoExamId;
  title: string;
  subtitle: string;
  goal: string;
  difficulty: string;
  estimatedMinutes: number;
  topics: PrecalculoTopic[];
};

export type DiagnosticQuestion = {
  id: string;
  examId: PrecalculoExamId;
  topicId: string;
  theme: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  proMax: string[];
  mistakeTag: string;
};

export const PRECALCULO_EXAMS: PrecalculoExam[] = [
  {
    id: "i1",
    title: "I1 · Álgebra, funciones y geometría analítica",
    subtitle: "La base para no perder puntos por errores chicos.",
    goal: "Dominar álgebra, funciones, rectas, distancia, pendiente y circunferencia.",
    difficulty: "Media",
    estimatedMinutes: 90,
    topics: [
      {
        id: "geometria-analitica",
        title: "Distancia entre puntos y rectas",
        theme: "Geometría analítica",
        why: "Sirve para calcular distancias, pendientes, ecuaciones de rectas y analizar gráficos.",
        ucFocus: "En MAT1000 normalmente te dan dos puntos y esperan que identifiques rápido qué fórmula usar.",
        skills: ["Identificar x1, y1, x2, y2", "Calcular distancia", "Calcular pendiente", "Interpretar rectas"],
        formulas: [
          "d = √((x₂-x₁)² + (y₂-y₁)²)",
          "m = (y₂-y₁)/(x₂-x₁)",
          "y - y₁ = m(x - x₁)"
        ],
        proMaxTips: [
          "Antes de reemplazar, etiqueta: x1, y1, x2, y2. Eso evita errores.",
          "Si ves dos puntos, piensa primero en distancia o pendiente.",
          "Si la pregunta pide longitud, usa distancia. Si pide inclinación, usa pendiente."
        ],
        commonMistakes: [
          "Restar x con y por apuro.",
          "Olvidar elevar al cuadrado.",
          "Confundir pendiente con distancia."
        ],
        solvedExamples: [
          {
            title: "Ejemplo real tipo UC: distancia",
            statement: "Calcula la distancia entre A(2,3) y B(6,6).",
            steps: [
              "Identifica: x1=2, y1=3, x2=6, y2=6.",
              "Reemplaza: d = √((6-2)² + (6-3)²).",
              "Calcula: d = √(4² + 3²) = √(16+9).",
              "Entonces d = √25 = 5."
            ],
            final: "La distancia es 5."
          },
          {
            title: "Ejemplo real tipo UC: pendiente",
            statement: "Encuentra la pendiente entre A(1,4) y B(5,12).",
            steps: [
              "Identifica: x1=1, y1=4, x2=5, y2=12.",
              "Usa m = (y2-y1)/(x2-x1).",
              "m = (12-4)/(5-1) = 8/4.",
              "m = 2."
            ],
            final: "La pendiente es 2."
          }
        ]
      },
      {
        id: "funciones",
        title: "Funciones, dominio y composición",
        theme: "Funciones",
        why: "Es un tema central porque conecta álgebra con gráficos.",
        ucFocus: "La UC suele preguntar dominio, composición y lectura de restricciones.",
        skills: ["Dominio", "Recorrido", "Composición", "Restricciones", "Lectura gráfica"],
        formulas: [
          "(f ∘ g)(x) = f(g(x))",
          "Dominio = valores permitidos de x",
          "Si hay denominador: denominador ≠ 0"
        ],
        proMaxTips: [
          "En composición, primero resuelve la función de adentro.",
          "Si aparece raíz par, exige que lo de adentro sea ≥ 0.",
          "Si aparece fracción, el denominador nunca puede ser cero."
        ],
        commonMistakes: [
          "Hacer f(g(x)) como g(f(x)).",
          "Olvidar restricciones.",
          "Confundir imagen con preimagen."
        ],
        solvedExamples: [
          {
            title: "Ejemplo real tipo UC: composición",
            statement: "Si f(x)=2x+1 y g(x)=x²-3, calcula (f∘g)(4).",
            steps: [
              "Primero va g porque está adentro.",
              "g(4)=4²-3=16-3=13.",
              "Ahora aplica f al resultado: f(13)=2·13+1.",
              "f(13)=27."
            ],
            final: "(f∘g)(4)=27."
          }
        ]
      }
    ]
  },
  {
    id: "i2",
    title: "I2 · Potencias, exponenciales y logaritmos",
    subtitle: "Propiedades, restricciones y ecuaciones.",
    goal: "Usar bien leyes de exponentes, logaritmos y funciones exponenciales.",
    difficulty: "Media-alta",
    estimatedMinutes: 100,
    topics: [
      {
        id: "logaritmos",
        title: "Logaritmos",
        theme: "Logaritmos",
        why: "Son una de las partes donde más se pierden puntos por propiedades mal usadas.",
        ucFocus: "Te pueden pedir resolver, simplificar o verificar restricciones.",
        skills: ["Definición", "Propiedades", "Cambio de base", "Restricciones"],
        formulas: [
          "log_b(a)=c ⇔ b^c=a",
          "log(ab)=log(a)+log(b)",
          "log(a^n)=nlog(a)"
        ],
        proMaxTips: [
          "Nunca separes log(a+b). Esa propiedad no existe.",
          "Antes de resolver, exige argumento positivo.",
          "Si ves log₂(8), pregúntate: ¿2 elevado a qué da 8?"
        ],
        commonMistakes: [
          "Creer que log(a+b)=log(a)+log(b).",
          "No verificar argumento positivo.",
          "Olvidar que la base debe ser positiva y distinta de 1."
        ],
        solvedExamples: [
          {
            title: "Ejemplo real tipo UC: definición",
            statement: "Calcula log₂(32).",
            steps: [
              "Pregunta clave: 2 elevado a qué número da 32.",
              "2⁵ = 32.",
              "Entonces log₂(32)=5."
            ],
            final: "La respuesta es 5."
          },
          {
            title: "Ejemplo real tipo UC: ecuación",
            statement: "Resuelve log₃(x)=4.",
            steps: [
              "Pasa a forma exponencial.",
              "log₃(x)=4 significa 3⁴=x.",
              "3⁴=81.",
              "Verifica: x=81 es positivo."
            ],
            final: "x=81."
          }
        ]
      },
      {
        id: "exponenciales",
        title: "Exponenciales",
        theme: "Funciones exponenciales",
        why: "Aparecen en crecimiento, decrecimiento y ecuaciones.",
        ucFocus: "La clave es reconocer base, asíntota y transformación.",
        skills: ["Crecimiento", "Decrecimiento", "Asíntotas", "Transformaciones"],
        formulas: [
          "f(x)=a·b^x",
          "b>1: crecimiento",
          "0<b<1: decrecimiento"
        ],
        proMaxTips: [
          "Mira primero la base b.",
          "Si b está entre 0 y 1, la función decrece.",
          "Si hay +c afuera, la asíntota horizontal se mueve a y=c."
        ],
        commonMistakes: [
          "Confundir base con exponente.",
          "Olvidar la asíntota.",
          "Aplicar logaritmo antes de aislar."
        ],
        solvedExamples: [
          {
            title: "Ejemplo real tipo UC: crecimiento",
            statement: "Para f(x)=3·2^x, calcula f(3).",
            steps: [
              "Reemplaza x=3.",
              "f(3)=3·2³.",
              "2³=8.",
              "f(3)=3·8=24."
            ],
            final: "f(3)=24."
          }
        ]
      }
    ]
  },
  {
    id: "i3",
    title: "I3 · Trigonometría y funciones trigonométricas",
    subtitle: "Círculo unitario, cuadrantes, amplitud, periodo y desfase.",
    goal: "Entender seno, coseno, tangente, radianes y gráficas trigonométricas.",
    difficulty: "Alta",
    estimatedMinutes: 120,
    topics: [
      {
        id: "cuadrantes",
        title: "Cuadrantes y signos",
        theme: "Trigonometría · Cuadrantes",
        why: "Muchas preguntas dependen solo de saber el signo de seno, coseno y tangente.",
        ucFocus: "Si te dicen el cuadrante y una razón trigonométrica, puedes deducir las demás.",
        skills: ["Signos por cuadrante", "Seno", "Coseno", "Tangente", "Triángulo de referencia"],
        formulas: [
          "tan(t)=sen(t)/cos(t)",
          "sen²(t)+cos²(t)=1",
          "Cuadrante I: sen +, cos +, tan +",
          "Cuadrante II: sen +, cos -, tan -",
          "Cuadrante III: sen -, cos -, tan +",
          "Cuadrante IV: sen -, cos +, tan -"
        ],
        proMaxTips: [
          "Si t está en el tercer cuadrante: seno negativo, coseno negativo y tangente positiva.",
          "Si te dan sen(t)=-12/13, piensa en triángulo 5-12-13.",
          "Como en QIII coseno es negativo, entonces cos(t)=-5/13.",
          "Finalmente tan(t)=sen/cos=(-12/13)/(-5/13)=12/5."
        ],
        commonMistakes: [
          "Olvidar el signo del cuadrante.",
          "Sacar coseno positivo cuando el ángulo está en QIII.",
          "No simplificar la división de fracciones."
        ],
        solvedExamples: [
          {
            title: "Ejemplo real tipo UC: tercer cuadrante",
            statement: "Si t está en el tercer cuadrante y sen(t)=-12/13, ¿cuál es tan(t)?",
            steps: [
              "Dato: sen(t)=opuesto/hipotenusa=-12/13.",
              "Por pitágoras aparece el triángulo 5-12-13.",
              "En el tercer cuadrante, coseno también es negativo.",
              "Entonces cos(t)=-5/13.",
              "tan(t)=sen(t)/cos(t).",
              "tan(t)=(-12/13)/(-5/13)=12/5."
            ],
            final: "tan(t)=12/5."
          },
          {
            title: "Ejemplo real tipo UC: segundo cuadrante",
            statement: "Si t está en QII y cos(t)=-3/5, encuentra sen(t).",
            steps: [
              "Dato: cos(t)=adyacente/hipotenusa=-3/5.",
              "Triángulo notable: 3-4-5.",
              "En QII el seno es positivo.",
              "Entonces sen(t)=4/5."
            ],
            final: "sen(t)=4/5."
          }
        ]
      },
      {
        id: "ondas-trig",
        title: "Gráficas seno y coseno",
        theme: "Trigonometría · Ondas",
        why: "Aquí se evalúa amplitud, periodo, desfase y lectura gráfica.",
        ucFocus: "Debes mirar A, k, b y c en y=A·sen(k(x-b))+c.",
        skills: ["Amplitud", "Periodo", "Desfase", "Máximos", "Mínimos", "Ceros"],
        formulas: [
          "y=A·sen(k(x-b))+c",
          "Amplitud=|A|",
          "Periodo=2π/|k|",
          "Desfase=b",
          "Eje medio=y=c"
        ],
        proMaxTips: [
          "El número A estira verticalmente.",
          "El número k cambia el periodo: más grande k, más apretada la onda.",
          "Si aparece (x-b), se mueve b hacia la derecha.",
          "Si aparece +c afuera, sube o baja toda la onda."
        ],
        commonMistakes: [
          "Creer que el periodo es k.",
          "Cambiar mal el signo del desfase.",
          "Olvidar el eje medio."
        ],
        solvedExamples: [
          {
            title: "Ejemplo real tipo UC: amplitud y periodo",
            statement: "Para y=3sen(2x), encuentra amplitud y periodo.",
            steps: [
              "A=3, entonces amplitud=|3|=3.",
              "k=2.",
              "Periodo=2π/|k|.",
              "Periodo=2π/2=π."
            ],
            final: "Amplitud=3 y periodo=π."
          }
        ]
      }
    ]
  },
  {
    id: "examen",
    title: "Examen · Integración completa",
    subtitle: "Mezcla I1, I2 e I3 con estrategia de prueba.",
    goal: "Entrenar velocidad, clasificación de temas y control de errores.",
    difficulty: "Alta",
    estimatedMinutes: 180,
    topics: [
      {
        id: "estrategia",
        title: "Estrategia de examen",
        theme: "Simulacro MAT1000",
        why: "El examen no solo mide conocimiento, también mide orden mental y velocidad.",
        ucFocus: "Primero clasifica el tema, luego eliges método.",
        skills: ["Clasificar", "Priorizar", "Descartar", "Revisar restricciones"],
        formulas: ["Distancia", "Composición", "Logaritmos", "Trigonometría", "Periodo"],
        proMaxTips: [
          "No empieces calculando sin saber qué tema es.",
          "Marca ejercicios largos y vuelve después si te trabas.",
          "Revisa restricciones antes de marcar alternativa."
        ],
        commonMistakes: [
          "Quedarse pegado en una pregunta.",
          "No leer el cuadrante.",
          "Olvidar restricciones."
        ],
        solvedExamples: [
          {
            title: "Estrategia real",
            statement: "Te aparece una pregunta larga con seno, cuadrante y fracción.",
            steps: [
              "Clasifica: trigonometría.",
              "Subtema: cuadrantes y razones trigonométricas.",
              "Anota signos del cuadrante.",
              "Luego recién calcula."
            ],
            final: "Ordenar el tema evita errores de signo."
          }
        ]
      }
    ]
  }
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "i1-q1",
    examId: "i1",
    topicId: "geometria-analitica",
    theme: "Geometría analítica · Distancia entre puntos",
    prompt: "Calcula la distancia entre A(2,3) y B(6,6).",
    options: ["4", "5", "7", "25"],
    answerIndex: 1,
    explanation: "x1=2, y1=3, x2=6, y2=6. d=√((6-2)²+(6-3)²)=√(16+9)=5.",
    proMax: [
      "Etiqueta coordenadas antes de reemplazar.",
      "La diferencia horizontal es 4 y la vertical es 3.",
      "Aparece el triángulo 3-4-5."
    ],
    mistakeTag: "distancia entre puntos"
  },
  {
    id: "i2-q1",
    examId: "i2",
    topicId: "logaritmos",
    theme: "Logaritmos · Definición",
    prompt: "Calcula log₂(32).",
    options: ["4", "5", "16", "30"],
    answerIndex: 1,
    explanation: "log₂(32)=5 porque 2⁵=32.",
    proMax: [
      "Traduce logaritmo a pregunta: ¿2 elevado a qué da 32?",
      "No uses propiedades si basta con la definición.",
      "Siempre verifica que el argumento sea positivo."
    ],
    mistakeTag: "definición de logaritmo"
  },
  {
    id: "i3-q1",
    examId: "i3",
    topicId: "cuadrantes",
    theme: "Trigonometría · Tercer cuadrante",
    prompt: "Si t está en el tercer cuadrante y sen(t)=-12/13, ¿cuál es tan(t)?",
    options: ["-12/5", "12/5", "-5/12", "5/12"],
    answerIndex: 1,
    explanation: "En QIII, seno y coseno son negativos, tangente positiva. Con sen=-12/13, cos=-5/13. Entonces tan=(-12/13)/(-5/13)=12/5.",
    proMax: [
      "QIII: sen negativo, cos negativo, tan positivo.",
      "Si ves 12/13, piensa en triángulo 5-12-13.",
      "cos(t) debe ser -5/13 porque estás en QIII.",
      "tan(t)=sen/cos=12/5."
    ],
    mistakeTag: "signos por cuadrante"
  },
  {
    id: "i3-q2",
    examId: "i3",
    topicId: "ondas-trig",
    theme: "Trigonometría · Amplitud y periodo",
    prompt: "Para y=3sen(2x), ¿cuál es la amplitud y el periodo?",
    options: ["3 y π", "2 y 3π", "3 y 2π", "2 y π"],
    answerIndex: 0,
    explanation: "Amplitud=|3|=3. Periodo=2π/|2|=π.",
    proMax: [
      "El número de afuera controla la amplitud.",
      "El número que multiplica x controla el periodo.",
      "Periodo=2π/k, no k."
    ],
    mistakeTag: "amplitud y periodo"
  },
  {
    id: "examen-q1",
    examId: "examen",
    topicId: "estrategia",
    theme: "Estrategia de prueba",
    prompt: "Antes de resolver un ejercicio largo, ¿qué conviene hacer primero?",
    options: ["Probar alternativas", "Clasificar el tema", "Derivar siempre", "Usar calculadora"],
    answerIndex: 1,
    explanation: "Clasificar el tema te dice qué fórmula o estrategia usar.",
    proMax: [
      "Tema primero, cálculo después.",
      "Si hay cuadrante, es trigonometría.",
      "Si hay log, revisa restricciones."
    ],
    mistakeTag: "estrategia"
  }
];

export const TUTOR_SUGGESTIONS = [
  "me cuesta entender seno",
  "no entiendo cuadrantes",
  "me confundo con el periodo",
  "no sé cuándo usar distancia",
  "me pierdo con logaritmos",
  "no entiendo el paso"
];

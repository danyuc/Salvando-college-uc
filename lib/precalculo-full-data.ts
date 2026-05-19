export type PrecalculoExamId = "i1" | "i2" | "i3" | "examen";

export type PrecalculoTopic = {
  id: string;
  title: string;
  why: string;
  skills: string[];
  formulas: string[];
  commonMistakes: string[];
  practice: string[];
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
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  mistakeTag: string;
};

export const PRECALCULO_EXAMS: PrecalculoExam[] = [
  {
    id: "i1",
    title: "I1 · Álgebra, funciones y geometría analítica",
    subtitle: "Base obligatoria para MAT1000.",
    goal: "Dominar álgebra, funciones, rectas, parábolas y distancia entre puntos.",
    difficulty: "Media",
    estimatedMinutes: 90,
    topics: [
      {
        id: "algebra-base",
        title: "Álgebra base",
        why: "Si fallas aquí, los ejercicios largos se caen por errores pequeños.",
        skills: ["Factorizar", "Productos notables", "Ecuaciones", "Fracciones algebraicas"],
        formulas: ["(a+b)^2 = a^2 + 2ab + b^2", "a^2 - b^2 = (a-b)(a+b)", "ax + b = 0 → x = -b/a"],
        commonMistakes: ["Cambiar signos", "Cancelar sumas como productos", "Olvidar restricciones"],
        practice: ["Factoriza expresiones", "Resuelve ecuaciones", "Encuentra restricciones"]
      },
      {
        id: "funciones",
        title: "Funciones",
        why: "La UC suele preguntar dominio, recorrido, composición e interpretación gráfica.",
        skills: ["Dominio", "Recorrido", "Composición", "Inversa", "Lectura gráfica"],
        formulas: ["(f ∘ g)(x) = f(g(x))", "f^{-1}(f(x)) = x", "Dominio = valores permitidos de x"],
        commonMistakes: ["Confundir dominio y recorrido", "Componer al revés", "Olvidar raíces y denominadores"],
        practice: ["Determina dominio", "Evalúa composición", "Interpreta gráficos"]
      },
      {
        id: "geometria-analitica",
        title: "Geometría analítica",
        why: "Aparece en distancia, pendiente, rectas y circunferencias.",
        skills: ["Distancia", "Punto medio", "Pendiente", "Recta", "Circunferencia"],
        formulas: ["d = √((x₂-x₁)^2 + (y₂-y₁)^2)", "m = (y₂-y₁)/(x₂-x₁)", "(x-h)^2 + (y-k)^2 = r^2"],
        commonMistakes: ["Invertir coordenadas", "Confundir radio y diámetro", "Usar mal pendiente vertical"],
        practice: ["Calcula distancia", "Encuentra rectas", "Identifica centro y radio"]
      }
    ]
  },
  {
    id: "i2",
    title: "I2 · Potencias, exponenciales y logaritmos",
    subtitle: "Bloque clave de propiedades y ecuaciones.",
    goal: "Dominar potencias, raíces, exponenciales, logaritmos y sus ecuaciones.",
    difficulty: "Media-alta",
    estimatedMinutes: 100,
    topics: [
      {
        id: "potencias-raices",
        title: "Potencias y raíces",
        why: "Es la base para exponentiales y simplificaciones.",
        skills: ["Leyes de exponentes", "Raíces", "Racionalización", "Exponentes fraccionarios"],
        formulas: ["a^m · a^n = a^(m+n)", "(a^m)^n = a^(mn)", "a^(1/n) = ⁿ√a"],
        commonMistakes: ["Sumar exponentes con bases distintas", "Distribuir mal raíces", "Olvidar restricciones"],
        practice: ["Simplifica potencias", "Convierte raíces", "Racionaliza"]
      },
      {
        id: "exponenciales",
        title: "Funciones exponenciales",
        why: "Conecta crecimiento, decrecimiento y modelamiento.",
        skills: ["Crecimiento", "Decrecimiento", "Asíntotas", "Transformaciones", "Ecuaciones"],
        formulas: ["f(x)=a·b^x", "b>1 crecimiento", "0<b<1 decrecimiento"],
        commonMistakes: ["Confundir base y exponente", "Ignorar asíntota", "Aplicar log sin aislar"],
        practice: ["Grafica exponenciales", "Resuelve ecuaciones", "Interpreta crecimiento"]
      },
      {
        id: "logaritmos",
        title: "Logaritmos",
        why: "Son muy frecuentes en MAT1000.",
        skills: ["Definición", "Propiedades", "Cambio de base", "Ecuaciones"],
        formulas: ["log_b(a)=c ⇔ b^c=a", "log(ab)=log(a)+log(b)", "log(a^n)=nlog(a)"],
        commonMistakes: ["Separar log(a+b)", "No verificar argumento positivo", "Olvidar base válida"],
        practice: ["Convierte log a exponencial", "Resuelve ecuaciones", "Verifica soluciones"]
      }
    ]
  },
  {
    id: "i3",
    title: "I3 · Trigonometría",
    subtitle: "Círculo unitario, ondas, periodo y transformaciones.",
    goal: "Entender seno, coseno, tangente, radianes, amplitud, periodo y desfase.",
    difficulty: "Alta",
    estimatedMinutes: 120,
    topics: [
      {
        id: "circulo-unitario",
        title: "Círculo unitario",
        why: "Permite entender seno y coseno sin memorizar a ciegas.",
        skills: ["Radianes", "Grados", "Cuadrantes", "Coordenadas", "Signos"],
        formulas: ["cos(θ)=x", "sin(θ)=y", "tan(θ)=sin(θ)/cos(θ)"],
        commonMistakes: ["Confundir seno con x", "No ubicar cuadrante", "Mezclar grados y radianes"],
        practice: ["Ubica ángulos notables", "Determina signos", "Convierte unidades"]
      },
      {
        id: "ondas-trig",
        title: "Gráficas seno y coseno",
        why: "La UC suele preguntar amplitud, periodo, desfase y lectura gráfica.",
        skills: ["Amplitud", "Periodo", "Desfase", "Máximos", "Mínimos", "Ceros"],
        formulas: ["y=A·sin(k(x-b))+c", "Amplitud=|A|", "Periodo=2π/|k|"],
        commonMistakes: ["Confundir k con periodo", "Cambiar mal desfase", "Olvidar desplazamiento vertical"],
        practice: ["Identifica amplitud", "Calcula periodo", "Grafica transformaciones"]
      },
      {
        id: "identidades",
        title: "Identidades trigonométricas",
        why: "Sirven para simplificar y resolver ecuaciones.",
        skills: ["Identidad pitagórica", "Razones recíprocas", "Ecuaciones simples"],
        formulas: ["sin²(x)+cos²(x)=1", "tan(x)=sin(x)/cos(x)", "sec(x)=1/cos(x)"],
        commonMistakes: ["Dividir por expresiones que pueden ser cero", "Perder soluciones", "No considerar periodicidad"],
        practice: ["Simplifica identidades", "Resuelve ecuaciones", "Revisa intervalo"]
      }
    ]
  },
  {
    id: "examen",
    title: "Examen · Integración MAT1000",
    subtitle: "Simulación final mezclando I1, I2 e I3.",
    goal: "Practicar estrategia, velocidad y control de errores.",
    difficulty: "Alta",
    estimatedMinutes: 180,
    topics: [
      {
        id: "repaso-integrado",
        title: "Repaso integrado",
        why: "El examen mezcla temas y exige reconocer rápido qué herramienta usar.",
        skills: ["Clasificar tema", "Elegir método", "Gestionar tiempo", "Revisar signos", "Descartar alternativas"],
        formulas: ["Distancia", "Composición", "Logaritmos", "Periodo", "Identidades"],
        commonMistakes: ["Empezar sin clasificar", "Perder tiempo", "No revisar restricciones"],
        practice: ["Simulacro por tiempo", "Repetir incorrectas", "Clasificar errores"]
      }
    ]
  }
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "i1-q1",
    examId: "i1",
    topicId: "geometria-analitica",
    prompt: "La distancia entre A(1,2) y B(4,6) es:",
    options: ["3", "4", "5", "7"],
    answerIndex: 2,
    explanation: "d = √((4-1)^2+(6-2)^2)=√(9+16)=5.",
    mistakeTag: "distancia entre puntos"
  },
  {
    id: "i1-q2",
    examId: "i1",
    topicId: "funciones",
    prompt: "Si f(x)=2x+1 y g(x)=x², entonces (f∘g)(3) es:",
    options: ["19", "49", "13", "7"],
    answerIndex: 0,
    explanation: "Primero g(3)=9. Luego f(9)=2·9+1=19.",
    mistakeTag: "composición de funciones"
  },
  {
    id: "i2-q1",
    examId: "i2",
    topicId: "logaritmos",
    prompt: "log₂(8) es igual a:",
    options: ["2", "3", "4", "8"],
    answerIndex: 1,
    explanation: "log₂(8)=3 porque 2³=8.",
    mistakeTag: "definición de logaritmo"
  },
  {
    id: "i2-q2",
    examId: "i2",
    topicId: "potencias-raices",
    prompt: "a³ · a⁵ se simplifica como:",
    options: ["a⁸", "a¹⁵", "2a⁸", "a²"],
    answerIndex: 0,
    explanation: "Al multiplicar potencias de igual base se suman exponentes.",
    mistakeTag: "leyes de exponentes"
  },
  {
    id: "i3-q1",
    examId: "i3",
    topicId: "circulo-unitario",
    prompt: "En el círculo unitario, sin(π/2) vale:",
    options: ["0", "1", "-1", "π"],
    answerIndex: 1,
    explanation: "En π/2 el punto es (0,1), por eso el seno vale 1.",
    mistakeTag: "círculo unitario"
  },
  {
    id: "i3-q2",
    examId: "i3",
    topicId: "ondas-trig",
    prompt: "Para y = 3sin(2x), la amplitud y el periodo son:",
    options: ["3 y π", "2 y 3π", "3 y 2π", "2 y π"],
    answerIndex: 0,
    explanation: "Amplitud=|3|. Periodo=2π/2=π.",
    mistakeTag: "amplitud y periodo"
  },
  {
    id: "examen-q1",
    examId: "examen",
    topicId: "repaso-integrado",
    prompt: "Antes de resolver un ejercicio largo, la mejor estrategia es:",
    options: ["Probar alternativas al azar", "Clasificar el tema y anotar restricciones", "Derivar siempre", "Usar calculadora primero"],
    answerIndex: 1,
    explanation: "Clasificar el tema evita usar fórmulas equivocadas y ayuda a controlar errores.",
    mistakeTag: "estrategia de examen"
  }
];

export const PAST_EXAMS = [
  { label: "I1 · Forma A", kind: "Control", status: "Disponible para cargar preguntas" },
  { label: "I1 · Forma B", kind: "Control", status: "Disponible para cargar preguntas" },
  { label: "I2 · 2024 / 2025", kind: "Control", status: "Mapa temático preparado" },
  { label: "I3 · Trigonometría", kind: "Control", status: "Prioridad alta" },
  { label: "Examen · MAT1000", kind: "Examen", status: "Simulación final" }
];

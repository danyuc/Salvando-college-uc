export type Mat1000Evaluation = "I1" | "I2" | "I3" | "EXAMEN"

export const MAT1000_FILTER_OPTIONS = {
  evaluaciones: ["I1", "I2", "I3", "EXAMEN"],
  modulos: [
    "Módulo 1: Recta y parábola",
    "Módulo 2: Inecuaciones",
    "Módulo 3: Funciones reales",
    "Módulo 4: Exponenciales y logaritmos",
    "Módulo 5: Trigonometría",
    "Módulo 6: Polinomios",
    "Módulo 7: Sucesiones y sumas",
  ],
  subtemas: [
    "Distancia entre puntos",
    "Intersección con ejes coordenados",
    "Ecuación de la recta",
    "Rectas paralelas y perpendiculares",
    "Sistemas lineales 2x2",
    "Parábola y modelos cuadráticos",
    "Modelamiento cuadrático",
    "Intervalos",
    "Inecuaciones lineales",
    "Inecuaciones cuadráticas",
    "Inecuaciones racionales",
    "Tabla de signos",
    "Valor absoluto",
    "Modelamiento con inecuaciones",
    "Dominio",
    "Recorrido",
    "Gráficas básicas",
    "Transformaciones de funciones",
    "Álgebra de funciones",
    "Composición de funciones",
    "Funciones inyectivas",
    "Función inversa",
    "Funciones por tramos",
    "Modelamiento con funciones",
    "Función exponencial",
    "Transformaciones exponenciales",
    "Propiedades de exponentes",
    "Función logarítmica",
    "Logaritmo como inversa",
    "Propiedades de logaritmos",
    "Ecuaciones exponenciales",
    "Ecuaciones logarítmicas",
    "Modelamiento exponencial y logarítmico",
    "Razones trigonométricas",
    "Circunferencia unitaria",
    "Radianes",
    "Ángulos notables",
    "Gráficas seno y coseno",
    "Amplitud",
    "Período",
    "Desfase",
    "Identidades trigonométricas",
    "Funciones trigonométricas inversas",
    "Modelamiento trigonométrico",
    "Polinomios",
    "Ceros de polinomios",
    "Multiplicidad",
    "Comportamiento al infinito",
    "División polinomial",
    "Teorema del factor",
    "Gráfica de polinomios",
    "Modelamiento polinomial",
    "Sucesiones",
    "Sucesiones aritméticas",
    "Sucesiones geométricas",
    "Notación sigma",
    "Sumas finitas",
    "Modelos discretos",
  ],
} as const

export const MAT1000_MODULES = {
  "Módulo 1: Recta y parábola": {
    id: "modulo_1",
    evaluaciones: ["I1", "EXAMEN"],
    subtemas: [
      "Distancia entre puntos",
      "Intersección con ejes coordenados",
      "Ecuación de la recta",
      "Rectas paralelas y perpendiculares",
      "Sistemas lineales 2x2",
      "Parábola y modelos cuadráticos",
      "Modelamiento cuadrático",
    ],
  },
  "Módulo 2: Inecuaciones": {
    id: "modulo_2",
    evaluaciones: ["I1", "EXAMEN"],
    subtemas: [
      "Intervalos",
      "Inecuaciones lineales",
      "Inecuaciones cuadráticas",
      "Inecuaciones racionales",
      "Tabla de signos",
      "Valor absoluto",
      "Modelamiento con inecuaciones",
    ],
  },
  "Módulo 3: Funciones reales": {
    id: "modulo_3",
    evaluaciones: ["I2", "EXAMEN"],
    subtemas: [
      "Dominio",
      "Recorrido",
      "Gráficas básicas",
      "Transformaciones de funciones",
      "Álgebra de funciones",
      "Composición de funciones",
      "Funciones inyectivas",
      "Función inversa",
      "Funciones por tramos",
      "Modelamiento con funciones",
    ],
  },
  "Módulo 4: Exponenciales y logaritmos": {
    id: "modulo_4",
    evaluaciones: ["I2", "EXAMEN"],
    subtemas: [
      "Función exponencial",
      "Transformaciones exponenciales",
      "Propiedades de exponentes",
      "Función logarítmica",
      "Logaritmo como inversa",
      "Propiedades de logaritmos",
      "Ecuaciones exponenciales",
      "Ecuaciones logarítmicas",
      "Modelamiento exponencial y logarítmico",
    ],
  },
  "Módulo 5: Trigonometría": {
    id: "modulo_5",
    evaluaciones: ["I3", "EXAMEN"],
    subtemas: [
      "Razones trigonométricas",
      "Circunferencia unitaria",
      "Radianes",
      "Ángulos notables",
      "Gráficas seno y coseno",
      "Amplitud",
      "Período",
      "Desfase",
      "Identidades trigonométricas",
      "Funciones trigonométricas inversas",
      "Modelamiento trigonométrico",
    ],
  },
  "Módulo 6: Polinomios": {
    id: "modulo_6",
    evaluaciones: ["EXAMEN"],
    subtemas: [
      "Polinomios",
      "Ceros de polinomios",
      "Multiplicidad",
      "Comportamiento al infinito",
      "División polinomial",
      "Teorema del factor",
      "Gráfica de polinomios",
      "Modelamiento polinomial",
    ],
  },
  "Módulo 7: Sucesiones y sumas": {
    id: "modulo_7",
    evaluaciones: ["EXAMEN"],
    subtemas: [
      "Sucesiones",
      "Sucesiones aritméticas",
      "Sucesiones geométricas",
      "Notación sigma",
      "Sumas finitas",
      "Modelos discretos",
    ],
  },
} as const

export function getMat1000ModulesForEvaluation(evaluation: string) {
  return Object.entries(MAT1000_MODULES)
    .filter(([, module]) => module.evaluaciones.includes(evaluation as any))
    .map(([label]) => label)
}

export function getMat1000SubtemasForModule(moduleLabel: string) {
  const first = Object.keys(MAT1000_MODULES)[0]
  const key = moduleLabel in MAT1000_MODULES ? moduleLabel : first
  return [...MAT1000_MODULES[key as keyof typeof MAT1000_MODULES].subtemas]
}

export function resolveModuloIdFromLabel(moduleLabel: string) {
  const first = Object.keys(MAT1000_MODULES)[0]
  const key = moduleLabel in MAT1000_MODULES ? moduleLabel : first
  return MAT1000_MODULES[key as keyof typeof MAT1000_MODULES].id
}

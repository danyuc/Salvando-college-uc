export const MAT1000_MODULES = {
  "Módulo 1: Recta y parábola": {
    id: "modulo_1",
    evaluaciones: ["I1", "EXAMEN"],
    subtemas: [
      "Distancia entre puntos",
      "Ecuación de la recta",
      "Rectas paralelas y perpendiculares",
      "Sistemas lineales 2x2",
      "Parábola y modelos cuadráticos",
      "Intervalos",
      "Inecuaciones lineales",
      "Inecuaciones cuadráticas",
      "Inecuaciones racionales",
      "Valor absoluto",
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
      "Funciones por tramos",
      "Dominio",
      "Recorrido",
      "Transformaciones de funciones",
      "Composición de funciones",
      "Función inversa",
      "Modelamiento con funciones",
    ],
  },
  "Módulo 4: Exponenciales y logaritmos": {
    id: "modulo_4",
    evaluaciones: ["I2", "EXAMEN"],
    subtemas: [
      "Función exponencial",
      "Función logarítmica",
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
      "Ángulos notables",
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
      "División polinomial",
      "Teorema del factor",
      "Gráfica de polinomios",
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

export const MAT1000_FILTER_OPTIONS = {
  evaluaciones: ["I1", "I2", "I3", "EXAMEN"],
  modulos: ["Todos", ...Object.keys(MAT1000_MODULES)],
  subtemas: ["Todos", ...Object.values(MAT1000_MODULES).flatMap(m => [...m.subtemas])],
} as const

export function getMat1000ModulesForEvaluation(evaluation: string) {
  const modules = Object.entries(MAT1000_MODULES)
    .filter(([, m]) => m.evaluaciones.includes(evaluation as any))
    .map(([label]) => label)

  return ["Todos", ...modules]
}

export function getMat1000SubtemasForModule(moduleLabel: string, evaluation = "I1") {
  if (!moduleLabel || moduleLabel === "Todos") {
    return [
      "Todos",
      ...Object.entries(MAT1000_MODULES)
        .filter(([, m]) => m.evaluaciones.includes(evaluation as any))
        .flatMap(([, m]) => [...m.subtemas]),
    ]
  }

  const key = moduleLabel as keyof typeof MAT1000_MODULES
  return MAT1000_MODULES[key]
    ? ["Todos", ...MAT1000_MODULES[key].subtemas]
    : ["Todos"]
}

export function resolveModuloIdFromLabel(moduleLabel: string) {
  if (!moduleLabel || moduleLabel === "Todos") return "modulo_1"
  const key = moduleLabel as keyof typeof MAT1000_MODULES
  return MAT1000_MODULES[key]?.id || "modulo_1"
}

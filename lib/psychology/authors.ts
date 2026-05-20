import type { PsychologyAuthor } from "./schema";

export const PSYCHOLOGY_AUTHORS: PsychologyAuthor[] = [
  {
    id: "gray",
    name: "Peter Gray",
    classIds: [
      "clase-4-memoria",
      "clase-6-razonamiento-inteligencia",
    ],
    conceptIds: [
      "memoria",
      "memoria-trabajo",
      "razonamiento",
      "inteligencia",
      "razonamiento-inductivo",
      "razonamiento-deductivo",
    ],
    importance: "alta",
    explanation:
      "Texto base usado para definir memoria, razonamiento e inteligencia. En Clase 4 aparece asociado a memoria como información que se almacena y recupera; en Clase 6 aparece asociado a razonamiento e inteligencia como procesos adaptativos.",
    sourceRefs: [
      { kind: "texto", label: "Gray (2008), Cap. 9 y Cap. 10" },
      { kind: "ppt", label: "Clase 4 y Clase 6" },
    ],
  },
  {
    id: "baddeley",
    name: "Alan Baddeley",
    classIds: ["clase-4-memoria"],
    conceptIds: [
      "memoria-trabajo",
      "bucle-fonologico",
      "agenda-visoespacial",
      "ejecutivo-central",
    ],
    importance: "alta",
    explanation:
      "Autor asociado al modelo de memoria de trabajo compuesto por bucle fonológico, agenda visoespacial y ejecutivo central.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 4 - Memoria de Trabajo (Baddeley)" },
      { kind: "texto", label: "Gray (2008), Cap. 9" },
    ],
  },
  {
    id: "bartlett",
    name: "Bartlett",
    classIds: ["clase-4-memoria"],
    conceptIds: ["memoria-constructiva", "esquemas", "falsas-memorias"],
    importance: "media",
    explanation:
      "Aparece vinculado en el material con esquemas, guiones preexistentes y construcción como distorsión. Requiere confirmación si fue desarrollado extensamente en clase.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 4 - Construcción como distorsión" },
      { kind: "cuaderno", label: "Apuntes Clase 4" },
    ],
  },
  {
    id: "dupuy",
    name: "Jean Pierre Dupuy",
    classIds: ["clase-4-memoria"],
    conceptIds: ["metafora-computador", "modelo-memoria"],
    importance: "media",
    explanation:
      "Usado para problematizar la metáfora computacional de la mente: modelamos máquinas a nuestra imagen y luego aplicamos esos modelos de vuelta a nosotros.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 4 - Jean Pierre Dupuy" },
    ],
  },
  {
    id: "pavlov",
    name: "Ivan Pavlov",
    classIds: ["clase-5-aprendizaje"],
    conceptIds: [
      "condicionamiento-clasico",
      "estimulo-incondicionado",
      "respuesta-incondicionada",
      "estimulo-condicionado",
      "respuesta-condicionada",
    ],
    importance: "alta",
    explanation:
      "Autor asociado al condicionamiento clásico y al aprendizaje por asociación entre estímulos.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - Condicionamiento Clásico" },
      { kind: "texto", label: "Feldman, aprendizaje" },
    ],
  },
  {
    id: "watson",
    name: "John B. Watson",
    classIds: ["clase-5-aprendizaje"],
    conceptIds: [
      "conductismo",
      "little-albert",
      "miedo-condicionado",
      "generalizacion",
    ],
    importance: "media",
    explanation:
      "Presentado como primer conductista y asociado al caso Little Albert para comprender miedo, fobias, aprendizaje y extinción.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - John B. Watson / Little Albert" },
    ],
  },
  {
    id: "skinner",
    name: "B. F. Skinner",
    classIds: ["clase-5-aprendizaje", "clase-7-lenguaje"],
    conceptIds: [
      "condicionamiento-operante",
      "reforzamiento",
      "refuerzo-positivo",
      "refuerzo-negativo",
      "castigo-positivo",
      "castigo-negativo",
      "programas-reforzamiento",
      "teoria-aprendizaje-lenguaje",
    ],
    importance: "alta",
    explanation:
      "Autor central para condicionamiento operante. En lenguaje aparece indirectamente vinculado a la teoría del aprendizaje del lenguaje por refuerzo y modelaje.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - Condicionamiento Operante" },
      { kind: "ppt", label: "Clase 7 - Adquisición: Teoría del aprendizaje" },
    ],
  },
  {
    id: "thorndike",
    name: "Thorndike",
    classIds: ["clase-5-aprendizaje"],
    conceptIds: ["ley-del-efecto", "condicionamiento-operante"],
    importance: "media",
    explanation:
      "Asociado a la ley del efecto: las respuestas que conducen a consecuencias satisfactorias tienen más probabilidades de repetirse.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 5 - Thorndike" },
    ],
  },
  {
    id: "duncker",
    name: "Karl Duncker",
    classIds: ["clase-6-razonamiento-inteligencia"],
    conceptIds: ["problema-vela", "insight", "fijacion-funcional"],
    importance: "media",
    explanation:
      "Asociado al problema de la vela como ejemplo de insight y cambio en la forma habitual de ver un problema.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Problema de la Vela" },
      { kind: "texto", label: "Gray (2008), Cap. 10" },
    ],
  },
  {
    id: "galton",
    name: "Francis Galton",
    classIds: ["clase-6-razonamiento-inteligencia"],
    conceptIds: ["inteligencia", "rapidez-mental", "agudeza-sensorial"],
    importance: "media",
    explanation:
      "Asociado a una visión de inteligencia basada en características básicas del sistema nervioso, rapidez y precisión para responder a estímulos.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Galton" },
      { kind: "texto", label: "Gray (2008), Cap. 10" },
    ],
  },
  {
    id: "binet",
    name: "Alfred Binet",
    classIds: ["clase-6-razonamiento-inteligencia"],
    conceptIds: ["inteligencia", "pruebas-inteligencia", "habilidades-escolares"],
    importance: "media",
    explanation:
      "Asociado a una concepción de inteligencia como conjunto de capacidades mentales de alto orden orientadas al trabajo escolar.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Binet" },
      { kind: "texto", label: "Gray (2008), Cap. 10" },
    ],
  },
  {
    id: "wechsler",
    name: "David Wechsler",
    classIds: ["clase-6-razonamiento-inteligencia"],
    conceptIds: ["ci", "pruebas-inteligencia", "subtests"],
    importance: "media",
    explanation:
      "Asociado a pruebas modernas de inteligencia y al uso de datos normativos para traducir puntajes crudos en CI.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Wechsler" },
      { kind: "texto", label: "Gray (2008), Cap. 10" },
    ],
  },
  {
    id: "spearman",
    name: "Charles Spearman",
    classIds: ["clase-6-razonamiento-inteligencia"],
    conceptIds: ["factor-g", "inteligencia-general"],
    importance: "media",
    explanation:
      "Asociado al factor g o inteligencia general, entendido como factor común detrás del rendimiento en distintas pruebas mentales.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Factor g" },
      { kind: "texto", label: "Gray (2008), Cap. 10" },
    ],
  },
  {
    id: "cattell",
    name: "Raymond Cattell",
    classIds: ["clase-6-razonamiento-inteligencia"],
    conceptIds: ["inteligencia-fluida", "inteligencia-cristalizada"],
    importance: "alta",
    explanation:
      "Asociado a la distinción entre inteligencia fluida y cristalizada.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 6 - Inteligencia fluida y cristalizada" },
      { kind: "texto", label: "Gray (2008), Cap. 10" },
    ],
  },
  {
    id: "feldman",
    name: "Robert Feldman",
    classIds: ["clase-5-aprendizaje", "clase-7-lenguaje"],
    conceptIds: ["aprendizaje", "lenguaje", "gramatica", "desarrollo-lenguaje"],
    importance: "alta",
    explanation:
      "Texto base para aprendizaje y lenguaje. En Clase 7 se usa su definición de lenguaje como comunicación de información mediante símbolos ordenados por reglas sistemáticas.",
    sourceRefs: [
      { kind: "texto", label: "Feldman (2010), capítulos de aprendizaje y lenguaje" },
      { kind: "ppt", label: "Clase 7 - Definición Feldman" },
    ],
  },
  {
    id: "chomsky",
    name: "Noam Chomsky",
    classIds: ["clase-7-lenguaje"],
    conceptIds: [
      "innatismo",
      "gramatica-universal",
      "dispositivo-adquisicion-lenguaje",
    ],
    importance: "alta",
    explanation:
      "Autor asociado al enfoque innatista del lenguaje, gramática universal y dispositivo de adquisición del lenguaje.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 7 - Innatismo (Chomsky)" },
      { kind: "texto", label: "Feldman, Módulo 22" },
    ],
  },
  {
    id: "sapir-whorf",
    name: "Sapir-Whorf",
    classIds: ["clase-7-lenguaje"],
    conceptIds: [
      "relatividad-linguistica",
      "hipotesis-fuerte",
      "hipotesis-debil",
      "aymara",
    ],
    importance: "alta",
    explanation:
      "Teoría asociada a la relatividad lingüística. La hipótesis fuerte determina; la hipótesis débil influye.",
    sourceRefs: [
      { kind: "ppt", label: "Clase 7 - Hipótesis de la Relatividad Lingüística" },
      { kind: "texto", label: "Feldman, Módulo 22" },
    ],
  },
];
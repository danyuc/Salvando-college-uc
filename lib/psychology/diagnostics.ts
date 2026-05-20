import type { PsychologyDiagnosticRule } from "./schema";

type DiagnosticTuple = [string, string, string, string[], string[], string[]?];

const diagnosticTuples: DiagnosticTuple[] = [
  ["modelo-modal", "Modelo modal", "clase-4-memoria", ["modelo-modal"], ["modelo-modal-memoria"]],
  ["baddeley", "Baddeley", "clase-4-memoria", ["memoria-trabajo", "bucle-fonologico", "agenda-visoespacial", "ejecutivo-central"], ["memoria-trabajo-baddeley"], ["baddeley"]],
  ["memoria-constructiva", "Memoria constructiva", "clase-4-memoria", ["memoria-constructiva"], ["distorsion-falsas-memorias"], ["bartlett"]],
  ["falsas-memorias", "Falsas memorias", "clase-4-memoria", ["falsas-memorias"], ["distorsion-falsas-memorias"], ["bartlett"]],
  ["amnesias", "Amnesia retrógrada vs anterógrada", "clase-4-memoria", ["amnesia-retrograda", "amnesia-anterograda"], ["amnesias"]],
  ["ei-ri-ec-rc", "EI/RI/EC/RC", "clase-5-aprendizaje", ["estimulo-incondicionado", "respuesta-incondicionada", "estimulo-condicionado", "respuesta-condicionada"], ["condicionamiento-clasico"], ["pavlov", "watson"]],
  ["refuerzo-castigo", "Refuerzo vs castigo", "clase-5-aprendizaje", ["refuerzo-positivo", "refuerzo-negativo", "castigo-positivo", "castigo-negativo"], ["refuerzo-castigo"], ["skinner"]],
  ["programas-reforzamiento", "Programas de reforzamiento", "clase-5-aprendizaje", ["programas-reforzamiento", "razon-fija", "razon-variable", "intervalo-fijo", "intervalo-variable"], ["programas-reforzamiento"], ["skinner"]],
  ["induccion-deduccion", "Inducción vs deducción", "clase-6-razonamiento-inteligencia", ["razonamiento-inductivo", "razonamiento-deductivo"], ["razonamiento-inductivo", "razonamiento-deductivo"], ["gray"]],
  ["sesgos-razonamiento", "Sesgos de razonamiento", "clase-6-razonamiento-inteligencia", ["sesgo-disponibilidad", "sesgo-confirmacion", "sesgo-mundo-predecible"], ["sesgos"], ["gray"]],
  ["insight-vela", "Insight y problema de la vela", "clase-6-razonamiento-inteligencia", ["insight", "problema-vela", "fijacion-funcional"], ["insight-creatividad"], ["duncker", "gray"]],
  ["fluida-cristalizada", "Inteligencia fluida vs cristalizada", "clase-6-razonamiento-inteligencia", ["inteligencia-fluida", "inteligencia-cristalizada"], ["fluida-cristalizada"], ["cattell"]],
  ["fonologia-sintaxis-semantica", "Fonología, sintaxis y semántica", "clase-7-lenguaje", ["fonologia", "sintaxis", "semantica"], ["gramatica"], ["feldman"]],
  ["adquisicion-lenguaje", "Adquisición del lenguaje", "clase-7-lenguaje", ["teoria-aprendizaje-lenguaje", "innatismo", "gramatica-universal", "interaccionismo"], ["teorias-adquisicion-lenguaje"], ["feldman", "chomsky", "skinner"]],
  ["sapir-whorf", "Sapir-Whorf fuerte vs débil", "clase-7-lenguaje", ["sapir-whorf", "hipotesis-fuerte", "hipotesis-debil"], ["relatividad-linguistica"], ["sapir-whorf"]],
];

export const PSYCHOLOGY_DIAGNOSTIC_RULES: PsychologyDiagnosticRule[] = diagnosticTuples.map(([id, label, classId, conceptIds, subtopicIds, authorIds = []]) => ({
  id: String(id),
  label: String(label),
  relatedClassIds: [String(classId)],
  relatedAuthorIds: authorIds as string[],
  relatedConceptIds: conceptIds as string[],
  relatedSubtopicIds: subtopicIds as string[],
  conceptIds: conceptIds as string[],
  authorIds: authorIds as string[],
  weaknessPattern: `Errores reiterados en ${label}.`,
  weaknessDetected: `Dificultad en ${label}.`,
  evidenceQuestionTags: [String(label).toLowerCase(), ...(conceptIds as string[])],
  recommendation: `Repasar ${label} y resolver casos aplicados con retroalimentación.`,
  recommendedReview: `Volver a la clase asociada y comparar definiciones, ejemplos y errores comunes de ${label}.`,
  recommendedPracticeFilters: {
    classId: String(classId),
    authorIds: authorIds as string[],
    conceptIds: conceptIds as string[],
    subtopicIds: subtopicIds as string[],
    tags: conceptIds as string[],
  },
  status: "source-supported",
}));

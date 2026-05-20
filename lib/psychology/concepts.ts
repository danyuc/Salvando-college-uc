import { PSYCHOLOGY_AUTHORS } from "./authors";
import { PSYCHOLOGY_CLASSES } from "./classes";
import type { PsychologyConcept, PsychologySourceRef } from "./schema";

function titleFromId(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sourcesForClass(classId: string): PsychologySourceRef[] {
  return PSYCHOLOGY_CLASSES.find((item) => item.id === classId)?.sourceRefs ?? [
    { kind: "requiere_confirmacion", label: "falta fuente" },
  ];
}

export const PSYCHOLOGY_CONCEPTS: PsychologyConcept[] = PSYCHOLOGY_CLASSES.flatMap((psychologyClass) =>
  psychologyClass.keyConceptIds.map((conceptId) => {
    const authorIds = PSYCHOLOGY_AUTHORS.filter((author) => author.conceptIds.includes(conceptId)).map(
      (author) => author.id
    );
    const title = titleFromId(conceptId);

    return {
      id: conceptId,
      title,
      name: title,
      classIds: [psychologyClass.id],
      authorIds,
      definition: `Concepto trabajado en ${psychologyClass.title}.`,
      description: psychologyClass.centralIdea,
      explanation: psychologyClass.centralTheme,
      commonMistakes: psychologyClass.examDisposition.expectedTraps,
      sourceRefs: sourcesForClass(psychologyClass.id),
      status: "source-supported",
    };
  })
);

export function getPsychologyConcept(conceptId: string) {
  return PSYCHOLOGY_CONCEPTS.find((concept) => concept.id === conceptId) ?? null;
}

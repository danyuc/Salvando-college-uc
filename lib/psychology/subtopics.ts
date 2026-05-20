import { PSYCHOLOGY_AUTHORS } from "./authors";
import { PSYCHOLOGY_CLASSES } from "./classes";
import type { PsychologySubtopic } from "./schema";

function titleFromId(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const PSYCHOLOGY_SUBTOPICS: PsychologySubtopic[] = PSYCHOLOGY_CLASSES.flatMap((psychologyClass) =>
  psychologyClass.subtopicIds.map((subtopicId) => {
    const relatedConceptIds = psychologyClass.keyConceptIds.filter((conceptId) => {
      const conceptWords = conceptId.split("-");
      return subtopicId.split("-").some((word) => conceptWords.includes(word));
    });
    const conceptIds = relatedConceptIds.length ? relatedConceptIds : psychologyClass.keyConceptIds.slice(0, 4);
    const authorIds = PSYCHOLOGY_AUTHORS.filter(
      (author) =>
        author.classIds.includes(psychologyClass.id) &&
        author.conceptIds.some((conceptId) => conceptIds.includes(conceptId))
    ).map((author) => author.id);

    return {
      id: subtopicId,
      classId: psychologyClass.id,
      title: titleFromId(subtopicId),
      explanation: psychologyClass.centralIdea,
      description: psychologyClass.centralTheme,
      conceptIds,
      authorIds,
      possibleExamQuestions: psychologyClass.examDisposition.likelyFormats.map(
        (format) => `${format}: ${titleFromId(subtopicId)}`
      ),
      sourceRefs: psychologyClass.sourceRefs,
      status: "source-supported",
    };
  })
);

export function getPsychologySubtopic(subtopicId: string) {
  return PSYCHOLOGY_SUBTOPICS.find((subtopic) => subtopic.id === subtopicId) ?? null;
}

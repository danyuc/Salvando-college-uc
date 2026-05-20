import { PSYCHOLOGY_QUESTIONS as LEGACY_QUESTIONS } from "../psychology-practice-data";
import { PSYCHOLOGY_AUTHORS } from "./authors";
import { PSYCHOLOGY_CLASSES } from "./classes";
import { PSYCHOLOGY_QUESTION_SEED } from "./questions.seed";
import type {
  PsychologyDifficulty,
  PsychologyQuestion,
  PsychologyQuestionType,
  PsychologySkill,
  PsychologySourceRef,
} from "./schema";

type LegacyQuestion = (typeof LEGACY_QUESTIONS)[number];

const classIdMap: Record<string, string> = {
  "psico-clase-4": "clase-4-memoria",
  "psico-clase-5": "clase-5-aprendizaje",
  "psico-clase-6": "clase-6-razonamiento-inteligencia",
  "psico-clase-7": "clase-7-lenguaje",
};

const difficultyMap: Record<string, PsychologyDifficulty> = {
  low: "baja",
  medium: "media",
  high: "alta",
};

const skillMap: Record<string, PsychologySkill> = {
  remember: "recordar",
  understand: "comprender",
  apply: "aplicar",
  analyze: "analizar",
  compare: "comparar",
  interpret: "interpretar",
};

const authorAliases: Record<string, string> = {
  gray: "gray",
  baddeley: "baddeley",
  bartlett: "bartlett",
  pavlov: "pavlov",
  watson: "watson",
  skinner: "skinner",
  thorndike: "thorndike",
  duncker: "duncker",
  galton: "galton",
  binet: "binet",
  wechsler: "wechsler",
  spearman: "spearman",
  cattell: "cattell",
  feldman: "feldman",
  chomsky: "chomsky",
  "sapir-whorf": "sapir-whorf",
  sapir: "sapir-whorf",
  whorf: "sapir-whorf",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sourceRefsFor(question: LegacyQuestion): PsychologySourceRef[] {
  if (question.source.kind === "texto") return [{ kind: "texto", label: question.source.label }];
  if (question.source.kind === "cuaderno") return [{ kind: "cuaderno", label: question.source.label }];
  if (question.source.kind === "prueba") return [{ kind: "prueba", label: question.source.label }];
  if (question.source.kind === "clase") return [{ kind: "ppt", label: question.source.label }];
  return [{ kind: "integracion", label: question.source.label }];
}

function inferAuthorIds(question: LegacyQuestion, classId: string) {
  const haystack = normalize([...question.tags, ...question.relatedConcepts, question.prompt].join(" "));
  const fromTags = Object.entries(authorAliases)
    .filter(([alias]) => haystack.includes(alias))
    .map(([, authorId]) => authorId);
  const classAuthors = PSYCHOLOGY_AUTHORS.filter((author) => author.classIds.includes(classId)).map((author) => author.id);
  return Array.from(new Set(fromTags.length ? fromTags : classAuthors.slice(0, 1)));
}

function inferConceptIds(question: LegacyQuestion, classId: string) {
  const psychologyClass = PSYCHOLOGY_CLASSES.find((item) => item.id === classId);
  if (!psychologyClass) return [];
  const haystack = normalize([...question.tags, ...question.relatedConcepts, question.prompt].join(" "));
  const matches = psychologyClass.keyConceptIds.filter((conceptId) => haystack.includes(normalize(conceptId)));
  return matches.length ? matches.slice(0, 4) : psychologyClass.keyConceptIds.slice(0, 2);
}

function inferSubtopicIds(question: LegacyQuestion, classId: string, conceptIds: string[]) {
  const psychologyClass = PSYCHOLOGY_CLASSES.find((item) => item.id === classId);
  if (!psychologyClass) return [];
  const haystack = normalize([...question.tags, ...question.relatedConcepts, question.prompt, ...conceptIds].join(" "));
  const matches = psychologyClass.subtopicIds.filter((subtopicId) => haystack.includes(normalize(subtopicId)));
  return matches.length ? matches.slice(0, 2) : psychologyClass.subtopicIds.slice(0, 1);
}

function convertLegacyQuestion(question: LegacyQuestion): PsychologyQuestion {
  const classId = classIdMap[question.classId] ?? question.classId;
  const conceptIds = inferConceptIds(question, classId);
  const authorIds = inferAuthorIds(question, classId);
  const subtopicIds = inferSubtopicIds(question, classId, conceptIds);
  const type = question.type as PsychologyQuestionType;
  const isObjective = type === "multiple_choice" || type === "application_case";

  return {
    id: `legacy-${question.id}`,
    classId,
    authorIds,
    conceptIds,
    subtopicIds,
    type,
    difficulty: difficultyMap[question.difficulty] ?? question.difficulty,
    cognitiveSkill: skillMap[question.cognitiveSkill] ?? question.cognitiveSkill,
    prompt: question.prompt,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    distractorExplanations: isObjective ? question.distractorExplanations : undefined,
    expectedAnswer: isObjective ? undefined : question.expectedAnswer ?? question.correctAnswer,
    gradingCriteria: isObjective
      ? undefined
      : question.gradingCriteria ?? [
          "Define el concepto central con vocabulario del curso.",
          "Aplica el concepto al caso o comparación solicitada.",
          "Explica por qué la respuesta no es solo sentido común.",
        ],
    commonMistake: question.weaknessDetected,
    weaknessDetected: question.weaknessDetected,
    studyRecommendation: question.studyRecommendation,
    sourceRefs: sourceRefsFor(question),
    tags: Array.from(new Set([...question.tags, ...question.relatedConcepts])),
  };
}

function uniqueQuestions(questions: PsychologyQuestion[]) {
  const seenIds = new Set<string>();
  const seenPrompts = new Set<string>();

  return questions.filter((question) => {
    const promptKey = normalize(question.prompt);
    if (seenIds.has(question.id) || seenPrompts.has(promptKey)) return false;
    seenIds.add(question.id);
    seenPrompts.add(promptKey);
    return true;
  });
}

export const PSYCHOLOGY_QUESTIONS: PsychologyQuestion[] = uniqueQuestions([
  ...PSYCHOLOGY_QUESTION_SEED,
  ...LEGACY_QUESTIONS.map(convertLegacyQuestion),
]);

export function getPsychologyQuestionsByClass(classId: string) {
  return PSYCHOLOGY_QUESTIONS.filter((question) => question.classId === classId);
}

export function getPsychologyQuestionsByAuthor(authorId: string) {
  return PSYCHOLOGY_QUESTIONS.filter((question) => question.authorIds.includes(authorId));
}

export function getPsychologyQuestionCounts() {
  return {
    total: PSYCHOLOGY_QUESTIONS.length,
    byClass: Object.fromEntries(
      PSYCHOLOGY_CLASSES.map((item) => [item.id, getPsychologyQuestionsByClass(item.id).length])
    ),
    byAuthor: Object.fromEntries(
      PSYCHOLOGY_AUTHORS.map((author) => [author.id, getPsychologyQuestionsByAuthor(author.id).length])
    ),
    byType: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.type] = (acc[question.type] ?? 0) + 1;
      return acc;
    }, {}),
    byDifficulty: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.difficulty] = (acc[question.difficulty] ?? 0) + 1;
      return acc;
    }, {}),
    byCognitiveSkill: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.cognitiveSkill] = (acc[question.cognitiveSkill] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

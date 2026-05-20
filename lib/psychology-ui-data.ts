import {
  PSYCHOLOGY_CLASSES as SOURCE_CLASSES,
  PSYCHOLOGY_QUESTIONS as SOURCE_QUESTIONS,
  type PsychologyQuestion as SourceQuestion,
} from "./psychology";

export type PsychologyQuestionType =
  | "multiple_choice"
  | "short_development"
  | "application_case"
  | "integrative_question";

export type PsychologyDifficulty = "low" | "medium" | "high";
export type PsychologyCognitiveSkill = "remember" | "understand" | "apply" | "analyze" | "compare" | "interpret";
export type PsychologyOption = { id: "A" | "B" | "C" | "D"; text: string };

export type PsychologyQuestion = {
  id: string;
  classId: string;
  type: PsychologyQuestionType;
  difficulty: PsychologyDifficulty;
  cognitiveSkill: PsychologyCognitiveSkill;
  prompt: string;
  options?: PsychologyOption[];
  correctAnswer: string;
  explanation: string;
  distractorExplanations: Record<string, string>;
  expectedAnswer?: string;
  gradingCriteria?: string[];
  source: { kind: "clase" | "texto" | "cuaderno" | "integracion" | "prueba"; label: string };
  tags: string[];
  relatedConcepts: string[];
  weaknessDetected: string;
  studyRecommendation: string;
};

export type PsychologyClass = {
  id: string;
  title: string;
  centralTheme: string;
  sources: string[];
  keyConcepts: string[];
  teacherEmphasis: string[];
  examPrediction: string;
  commonErrors: string[];
};

export const PSYCHOLOGY_SUBJECT = {
  id: "psicologia-procesos-basicos",
  name: "Psicología / Procesos Psicológicos Básicos",
  description: "Práctica estudiantil basada en clases, textos, cuaderno y estilo de prueba universitaria.",
  assessmentStyle: "Desarrollo, aplicación, comparación conceptual y alternativas con distractores plausibles.",
  examPattern: "Patrón esperado: explicar, aplicar y conectar conceptos sin inventar contenido externo.",
} as const;

const difficultyMap: Record<string, PsychologyDifficulty> = {
  baja: "low",
  media: "medium",
  alta: "high",
  low: "low",
  medium: "medium",
  high: "high",
};

const skillMap: Record<string, PsychologyCognitiveSkill> = {
  recordar: "remember",
  comprender: "understand",
  aplicar: "apply",
  analizar: "analyze",
  comparar: "compare",
  interpretar: "interpret",
  integrar: "analyze",
  remember: "remember",
  understand: "understand",
  apply: "apply",
  analyze: "analyze",
  compare: "compare",
  interpret: "interpret",
};

function labelFromId(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanText(value: string) {
  return value
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Ã", "Á")
    .replaceAll("Ã‰", "É")
    .replaceAll("Ã", "Í")
    .replaceAll("Ã“", "Ó")
    .replaceAll("Ãš", "Ú")
    .replaceAll("Â¿", "¿")
    .replaceAll("Â¡", "¡")
    .replaceAll("Â·", "·")
    .replaceAll("â€¢", "•");
}

function sourceKind(kind: string): PsychologyQuestion["source"]["kind"] {
  if (kind === "ppt") return "clase";
  if (kind === "texto" || kind === "cuaderno" || kind === "prueba") return kind;
  return "integracion";
}

function scoreForSeed(question: PsychologyQuestion, seed: number) {
  let score = seed;
  for (const char of question.id + question.prompt) {
    score = (score * 31 + char.charCodeAt(0)) % 1000003;
  }
  return score;
}

function seededQuestions(questions: PsychologyQuestion[], seed = 1) {
  return [...questions].sort((a, b) => scoreForSeed(a, seed) - scoreForSeed(b, seed));
}

function toUiQuestion(question: SourceQuestion): PsychologyQuestion {
  const source = question.sourceRefs[0] ?? { kind: "integracion", label: "falta fuente" };

  return {
    id: question.id,
    classId: question.classId,
    type: question.type,
    difficulty: difficultyMap[question.difficulty] ?? "medium",
    cognitiveSkill: skillMap[question.cognitiveSkill] ?? "understand",
    prompt: cleanText(question.prompt),
    options: question.options?.map((option) => ({ ...option, text: cleanText(option.text) })),
    correctAnswer: question.correctAnswer,
    explanation: cleanText(question.explanation),
    distractorExplanations: Object.fromEntries(
      Object.entries(question.distractorExplanations ?? {}).map(([key, value]) => [key, cleanText(value)])
    ),
    expectedAnswer: question.expectedAnswer ? cleanText(question.expectedAnswer) : undefined,
    gradingCriteria: question.gradingCriteria?.map(cleanText),
    source: { kind: sourceKind(source.kind), label: cleanText(source.label) },
    tags: question.tags.map(cleanText),
    relatedConcepts: [...question.conceptIds, ...question.subtopicIds].map(labelFromId),
    weaknessDetected: cleanText(question.weaknessDetected),
    studyRecommendation: cleanText(question.studyRecommendation),
  };
}

export const PSYCHOLOGY_CLASSES: PsychologyClass[] = SOURCE_CLASSES.map((item) => ({
  id: item.id,
  title: cleanText(item.title),
  centralTheme: cleanText(item.centralTheme),
  sources: item.sourceRefs.map((source) => cleanText(`${source.label}${source.detail ? `: ${source.detail}` : ""}`)),
  keyConcepts: item.keyConceptIds.map(labelFromId),
  teacherEmphasis: [cleanText(item.centralIdea)],
  examPrediction: `Probabilidad ${item.examDisposition.probability}. Formatos: ${item.examDisposition.likelyFormats.join(", ")}.`,
  commonErrors: item.examDisposition.expectedTraps.map(cleanText),
}));

export const PSYCHOLOGY_QUESTIONS: PsychologyQuestion[] = SOURCE_QUESTIONS.map(toUiQuestion);

export const PSYCHOLOGY_EXPECTED_COUNTS_BY_CLASS = {
  "clase-4-memoria": 50,
  "clase-5-aprendizaje": 50,
  "clase-6-razonamiento-inteligencia": 50,
  "clase-7-lenguaje": 50,
} as const;

export function getPsychologyQuestionsByClass(classId: string) {
  return PSYCHOLOGY_QUESTIONS.filter((question) => question.classId === classId);
}

export function getPsychologyDiagnosticQuestions(count = 24, seed = 1) {
  const selected: PsychologyQuestion[] = [];
  const classIds = PSYCHOLOGY_CLASSES.map((item) => item.id);
  let round = 0;
  while (selected.length < count && selected.length < PSYCHOLOGY_QUESTIONS.length) {
    for (const classId of classIds) {
      const pool = seededQuestions(
        PSYCHOLOGY_QUESTIONS.filter((question) => question.classId === classId),
        seed
      );
      const next = pool[round];
      if (next && !selected.some((item) => item.id === next.id)) selected.push(next);
      if (selected.length >= count) break;
    }
    round += 1;
  }
  return selected;
}

export function getPsychologyExamSimulation(seed = 1) {
  const selected: PsychologyQuestion[] = [];
  const add = (questions: PsychologyQuestion[], max: number) => {
    for (const question of seededQuestions(questions, seed + selected.length)) {
      if (!selected.some((item) => item.id === question.id)) selected.push(question);
      if (selected.length >= max) break;
    }
  };

  add(PSYCHOLOGY_CLASSES.flatMap((item) => seededQuestions(getPsychologyQuestionsByClass(item.id), seed).slice(0, 2)), 8);
  add(PSYCHOLOGY_QUESTIONS.filter((question) => question.type === "application_case"), 14);
  add(PSYCHOLOGY_QUESTIONS.filter((question) => question.type === "integrative_question"), 18);
  add(PSYCHOLOGY_QUESTIONS, 20);

  return selected.slice(0, 20);
}

export function getPsychologyClassSummary(classId: string) {
  return PSYCHOLOGY_CLASSES.find((item) => item.id === classId) ?? null;
}

export function getPsychologyQuestionById(questionId: string) {
  return PSYCHOLOGY_QUESTIONS.find((question) => question.id === questionId) ?? null;
}

export function getPsychologyQuestionCounts() {
  return {
    total: PSYCHOLOGY_QUESTIONS.length,
    byClass: Object.fromEntries(PSYCHOLOGY_CLASSES.map((item) => [item.id, getPsychologyQuestionsByClass(item.id).length])),
    byType: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.type] = (acc[question.type] ?? 0) + 1;
      return acc;
    }, {}),
    byDifficulty: PSYCHOLOGY_QUESTIONS.reduce<Record<string, number>>((acc, question) => {
      acc[question.difficulty] = (acc[question.difficulty] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

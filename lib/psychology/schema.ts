export type PsychologyQuestionType =
  | "multiple_choice"
  | "short_development"
  | "application_case"
  | "integrative_question";

export type PsychologyDifficulty = "baja" | "media" | "alta";

export type PsychologySkill =
  | "recordar"
  | "comprender"
  | "aplicar"
  | "analizar"
  | "comparar"
  | "interpretar"
  | "integrar";

export type PsychologySourceKind =
  | "ppt"
  | "texto"
  | "cuaderno"
  | "prueba"
  | "rubrica"
  | "integracion"
  | "requiere_confirmacion";

export type PsychologyOption = {
  id: "A" | "B" | "C" | "D";
  text: string;
};

export type PsychologySourceRef = {
  kind: PsychologySourceKind;
  label: string;
  detail?: string;
};

export type PsychologyClass = {
  id: string;
  number: number;
  title: string;
  routeSlug: string;
  centralTheme: string;
  centralIdea: string;
  sourceRefs: PsychologySourceRef[];
  keyConceptIds: string[];
  authorIds: string[];
  subtopicIds: string[];
  examDisposition: {
    probability: "baja" | "media" | "alta";
    likelyFormats: Array<"alternativa" | "desarrollo" | "aplicacion" | "integracion">;
    expectedTraps: string[];
  };
};

export type PsychologyAuthor = {
  id: string;
  name: string;
  classIds: string[];
  conceptIds: string[];
  importance: "baja" | "media" | "alta";
  explanation: string;
  sourceRefs: PsychologySourceRef[];
};

export type PsychologyConcept = {
  id: string;
  name: string;
  classIds: string[];
  authorIds: string[];
  definition: string;
  explanation: string;
  commonMistakes: string[];
  sourceRefs: PsychologySourceRef[];
};

export type PsychologySubtopic = {
  id: string;
  classId: string;
  title: string;
  explanation: string;
  conceptIds: string[];
  authorIds: string[];
  possibleExamQuestions: string[];
  sourceRefs: PsychologySourceRef[];
};

export type PsychologyQuestion = {
  id: string;
  classId: string;
  authorIds: string[];
  conceptIds: string[];
  subtopicIds: string[];
  type: PsychologyQuestionType;
  difficulty: PsychologyDifficulty;
  cognitiveSkill: PsychologySkill;
  prompt: string;
  options?: PsychologyOption[];
  correctAnswer: string;
  explanation: string;
  distractorExplanations?: Partial<Record<"A" | "B" | "C" | "D", string>>;
  expectedAnswer?: string;
  gradingCriteria?: string[];
  commonMistake: string;
  weaknessDetected: string;
  studyRecommendation: string;
  sourceRefs: PsychologySourceRef[];
  tags: string[];
};

export type PsychologySimulation = {
  id: string;
  title: string;
  description: string;
  classIds: string[];
  questionCount: number;
  difficultyDistribution: {
    baja: number;
    media: number;
    alta: number;
  };
  typeDistribution: Partial<Record<PsychologyQuestionType, number>>;
  suggestedMinutes: number;
  rules: string[];
};

export type PsychologyDiagnosticRule = {
  id: string;
  label: string;
  conceptIds: string[];
  authorIds?: string[];
  weaknessPattern: string;
  recommendation: string;
};
export type Difficulty = "baja" | "media" | "alta";
export type QuestionType = "alternativas" | "desarrollo" | "mixta" | "multiple_choice" | "numeric" | "graph" | "modeling";

export interface PastExamExercise {
  id: string;
  sourceFile: string;
  page: number;
  eval: "I1" | "I2" | "I3" | "Examen" | string;
  year: string;
  forma: string;
  number: number;
  theme: string;
  subtopic: string;
  difficulty: Difficulty;
  questionType: QuestionType | string;
  mathType?: string;
  pattern: string;
  hasGraph: boolean;
  solutionStatus: "oficial" | "propuesta" | "requiere solución" | string;
  prompt: string;
}

export interface UCPattern {
  id: string;
  name: string;
  frequency: number;
  structure: string;
  invariantLogic: string;
  method: string;
  commonErrors: string[];
  level: string;
  examples: string[];
}

export interface UCVariant {
  id: string;
  sourcePattern: string;
  prompt: string;
  answer: string;
  validationStatus: "proposed" | "requires validation";
}

export interface GeneratedPracticeQuestion {
  id: string;
  moduleId: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  prompt: string;
  options?: {label: string; text: string}[];
  correctAnswer: string;
  explanation: string;
  distractorExplanations: string[];
  steps: string[];
  formulaRefs: string[];
  formulaMemoryAid: string;
  tutorHints: string[];
  tip: string;
  commonMistake: string;
  graphConfig?: GraphConfig | null;
  sourcePattern: string;
  basedOnPastExamId: string;
  validationStatus: "proposed" | "requires validation";
}

export interface GraphConfig {
  type: string;
  sourcePage?: number;
  points?: number[][];
  xRange?: number[];
  yRange?: number[];
  labels?: boolean;
  pattern?: string;
}

export interface PastExamSummary {
  id: string;
  file: string;
  eval: string;
  year: string;
  forma: string;
  pages: string;
  exerciseCount: number;
  themes: Record<string, number>;
  patterns: Record<string, number>;
  hasGraphs: boolean;
}

export interface GlobalMAT1000Analysis {
  totalExercises: number;
  totalPastExamForms: number;
  topicRanking: {theme: string; count: number}[];
  patternRanking: {pattern: string; count: number}[];
}

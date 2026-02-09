export interface PathStep {
  step: number;
  title: string;
  objective: string;
  hasExercise: boolean;
  exerciseType: "code" | "question" | "creative";
}

export interface LearningPath {
  id: string;
  topic: string;
  description: string;
  steps: PathStep[];
  estimatedMinutes: number;
  includesCode: boolean;
  codeLanguage?: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  learningPath: LearningPath;
  currentStep: number;
  completedSteps: number[];
  currentAttempt: number;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
}

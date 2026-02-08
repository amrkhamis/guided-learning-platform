export interface CourseExercise {
  type: "code" | "question";
  prompt: string;
  language?: string;
  test?: string;
  hints?: string[];
}

export interface CourseStep {
  step: number;
  title: string;
  objective: string;
  teach: string;
  exercise: CourseExercise;
  checkUnderstanding: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  estimatedMinutes: number;
  systemPrompt: string;
  steps: CourseStep[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface StepProgress {
  stepNumber: number;
  completed: boolean;
  codeSubmitted?: string;
  attempts: number;
}

export interface CourseProgress {
  courseId: string;
  currentStep: number;
  steps: StepProgress[];
  startedAt: string;
  completedAt?: string;
}

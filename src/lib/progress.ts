import type { CourseProgress } from "./types";

const STORAGE_KEY = "glp_progress";

function getAll(): Record<string, CourseProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, CourseProgress>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCourseProgress(
  courseId: string
): CourseProgress | undefined {
  const all = getAll();
  return all[courseId];
}

export function initCourseProgress(
  courseId: string,
  totalSteps: number
): CourseProgress {
  const existing = getCourseProgress(courseId);
  if (existing) return existing;

  const progress: CourseProgress = {
    courseId,
    currentStep: 1,
    steps: Array.from({ length: totalSteps }, (_, i) => ({
      stepNumber: i + 1,
      completed: false,
      attempts: 0,
    })),
    startedAt: new Date().toISOString(),
  };

  const all = getAll();
  all[courseId] = progress;
  saveAll(all);
  return progress;
}

export function completeStep(courseId: string, stepNumber: number) {
  const all = getAll();
  const progress = all[courseId];
  if (!progress) return;

  const stepIdx = progress.steps.findIndex(
    (s) => s.stepNumber === stepNumber
  );
  if (stepIdx !== -1) {
    progress.steps[stepIdx].completed = true;
  }

  // Advance to next step
  if (stepNumber < progress.steps.length) {
    progress.currentStep = stepNumber + 1;
  }

  // Check if course is complete
  if (progress.steps.every((s) => s.completed)) {
    progress.completedAt = new Date().toISOString();
  }

  all[courseId] = progress;
  saveAll(all);
}

export function recordAttempt(
  courseId: string,
  stepNumber: number,
  code?: string
) {
  const all = getAll();
  const progress = all[courseId];
  if (!progress) return;

  const stepIdx = progress.steps.findIndex(
    (s) => s.stepNumber === stepNumber
  );
  if (stepIdx !== -1) {
    progress.steps[stepIdx].attempts += 1;
    if (code) {
      progress.steps[stepIdx].codeSubmitted = code;
    }
  }

  all[courseId] = progress;
  saveAll(all);
}

export function resetCourseProgress(courseId: string) {
  const all = getAll();
  delete all[courseId];
  saveAll(all);
}

import type { Course } from "./types";
import pythonBasics from "@/content/courses/python-basics.json";

const courses: Course[] = [pythonBasics as Course];

export function getCourses(): Course[] {
  return courses;
}

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCourseStep(courseId: string, stepNumber: number) {
  const course = getCourse(courseId);
  if (!course) return undefined;
  return course.steps.find((s) => s.step === stepNumber);
}

export function buildTutorSystemPrompt(
  course: Course,
  stepNumber: number,
  progress: { completedSteps: number[]; currentAttempt: number }
): string {
  const step = course.steps.find((s) => s.step === stepNumber);
  if (!step) return course.systemPrompt;

  const progressSummary =
    progress.completedSteps.length > 0
      ? `The student has completed steps: ${progress.completedSteps.join(", ")}. They are now on step ${stepNumber} of ${course.steps.length}.`
      : `This is the student's first step (step ${stepNumber} of ${course.steps.length}).`;

  const attemptNote =
    progress.currentAttempt > 1
      ? `This is their attempt #${progress.currentAttempt} at this step. Be extra patient and try a different explanation approach.`
      : "";

  return `${course.systemPrompt}

---
CURRENT CONTEXT:
${progressSummary}
${attemptNote}

CURRENT STEP: "${step.title}"
LEARNING OBJECTIVE: ${step.objective}

YOUR TEACHING INSTRUCTIONS FOR THIS STEP:
${step.teach}

EXERCISE TO GIVE THE STUDENT:
${step.exercise.prompt}

After the student completes the exercise correctly, CHECK THEIR UNDERSTANDING:
${step.checkUnderstanding}

IMPORTANT: Start by teaching the concept. Then give the exercise. Then check understanding. Only when all three are done should you tell the student they can move to the next step. Do NOT rush through these phases.

If the student submits code, you will receive the execution result. Use it to give specific, helpful feedback.`;
}

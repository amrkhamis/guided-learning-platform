import type { LearningPath, LearningSession } from "./types";

const STORAGE_KEY = "glp_sessions";

function getAll(): Record<string, LearningSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, LearningSession>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createSession(learningPath: LearningPath): LearningSession {
  const session: LearningSession = {
    id: learningPath.id,
    learningPath,
    currentStep: 1,
    completedSteps: [],
    currentAttempt: 1,
    startedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };

  const all = getAll();
  all[session.id] = session;
  saveAll(all);
  return session;
}

export function getSessions(): LearningSession[] {
  const all = getAll();
  return Object.values(all).sort(
    (a, b) =>
      new Date(b.lastAccessedAt).getTime() -
      new Date(a.lastAccessedAt).getTime()
  );
}

export function getSession(id: string): LearningSession | undefined {
  const all = getAll();
  return all[id];
}

export function completeStep(sessionId: string, stepNumber: number) {
  const all = getAll();
  const session = all[sessionId];
  if (!session) return;

  if (!session.completedSteps.includes(stepNumber)) {
    session.completedSteps.push(stepNumber);
  }

  // Advance to next step if not at end
  if (stepNumber < session.learningPath.steps.length) {
    session.currentStep = stepNumber + 1;
  }

  // Check if all steps are done
  if (session.completedSteps.length === session.learningPath.steps.length) {
    session.completedAt = new Date().toISOString();
  }

  session.currentAttempt = 1;
  session.lastAccessedAt = new Date().toISOString();

  all[sessionId] = session;
  saveAll(all);
}

export function recordAttempt(sessionId: string) {
  const all = getAll();
  const session = all[sessionId];
  if (!session) return;

  session.currentAttempt += 1;
  session.lastAccessedAt = new Date().toISOString();

  all[sessionId] = session;
  saveAll(all);
}

export function deleteSession(id: string) {
  const all = getAll();
  delete all[id];
  saveAll(all);
}

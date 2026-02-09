import { streamText, type CoreMessage } from "ai";
import { model } from "@/lib/ai";
import type { LearningPath } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, learningPath, stepNumber, completedSteps, currentAttempt } =
      body as {
        messages: CoreMessage[];
        learningPath: LearningPath;
        stepNumber: number;
        completedSteps: number[];
        currentAttempt: number;
      };

    if (!learningPath || !messages) {
      return Response.json(
        { error: "Missing required fields: messages, learningPath" },
        { status: 400 }
      );
    }

    const systemPrompt = buildTutorSystemPrompt(learningPath, stepNumber, {
      completedSteps: completedSteps || [],
      currentAttempt: currentAttempt || 1,
    });

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      onError({ error }) {
        console.error("[chat] Stream error:", error);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[chat] Request error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildTutorSystemPrompt(
  path: LearningPath,
  stepNumber: number,
  progress: { completedSteps: number[]; currentAttempt: number }
): string {
  const step = path.steps.find((s) => s.step === stepNumber);
  if (!step) return getBaseTutorPrompt(path);

  const progressSummary =
    progress.completedSteps.length > 0
      ? `The student has completed steps: ${progress.completedSteps.join(", ")}. They are now on step ${stepNumber} of ${path.steps.length}.`
      : `This is the student's first step (step ${stepNumber} of ${path.steps.length}).`;

  const attemptNote =
    progress.currentAttempt > 1
      ? `This is their attempt #${progress.currentAttempt} at this step. Be extra patient and try a different explanation approach.`
      : "";

  const codeNote = path.includesCode
    ? `This topic involves writing code${path.codeLanguage ? ` in ${path.codeLanguage}` : ""}. When giving code exercises, be specific about what to write and provide clear success criteria.`
    : "This is a non-coding topic. Focus on conceptual understanding, real-world examples, and thought exercises.";

  const exerciseType =
    step.exerciseType === "code"
      ? "coding"
      : step.exerciseType === "creative"
        ? "creative"
        : "thought";

  const exerciseNote = step.hasExercise
    ? `This step has a "${step.exerciseType}" exercise. After teaching the concept, give the student a hands-on ${exerciseType} exercise to practice.`
    : "This step is primarily conceptual. Focus on clear explanations and check understanding through questions.";

  return `${getBaseTutorPrompt(path)}

---
CURRENT CONTEXT:
${progressSummary}
${attemptNote}

${codeNote}

CURRENT STEP: "${step.title}"
LEARNING OBJECTIVE: ${step.objective}

${exerciseNote}

TEACHING APPROACH FOR THIS STEP:
1. First, teach the concept clearly with examples
2. Then, give the student an exercise appropriate to the step
3. Review their answer and provide specific feedback
4. Check their understanding by asking them to explain the concept back
5. Only when they demonstrate understanding should you tell them to move to the next step

IMPORTANT: Teach one concept at a time. Do NOT rush through phases.`;
}

function getBaseTutorPrompt(path: LearningPath): string {
  const stepList = path.steps
    .map((s) => `  Step ${s.step}: ${s.title} — ${s.objective}`)
    .join("\n");

  return `You are a friendly, patient tutor teaching "${path.topic}" to a learner. Follow these rules:

1. PACING: Teach one concept at a time. Never dump multiple concepts in one message.
2. INTERACTION: After explaining a concept, always ask the student a question or give them an exercise. Never just lecture.
3. FEEDBACK: When reviewing answers, don't just say correct/wrong. Explain WHY.
4. CHECK UNDERSTANDING: Before moving to the next step, ask the student to explain the concept in their own words.
5. ENCOURAGEMENT: Be encouraging but honest. If something is wrong, say so kindly and help them fix it.
6. ADAPTATION: If the student seems to already know a concept, acknowledge it and move faster. If they're struggling, slow down and use simpler analogies.
7. EXAMPLES: Use real-world, relatable examples. Make it practical.
8. ONE QUESTION AT A TIME: Never ask multiple questions in one message.
9. TONE: Be warm and conversational, like a smart friend helping you learn — not a textbook.
10. EXERCISES: When giving exercises, be specific about what you want. For code exercises, describe the expected output. For questions, make them thought-provoking. For creative exercises, give clear guidelines.

The learning path has ${path.steps.length} steps:
${stepList}`;
}

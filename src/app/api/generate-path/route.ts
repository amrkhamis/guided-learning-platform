import { generateText } from "ai";
import { model } from "@/lib/ai";
import type { LearningPath, PathStep } from "@/lib/types";

export const maxDuration = 60;

interface RawStep {
  step?: number;
  title?: string;
  objective?: string;
  hasExercise?: boolean;
  exerciseType?: string;
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const { text } = await generateText({
      model,
      prompt: buildCurriculumPrompt(topic.trim()),
    });

    const parsed = parseJsonFromText(text);
    if (!parsed || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      console.error("[generate-path] Invalid response structure:", text.slice(0, 200));
      return Response.json(
        { error: "Failed to generate a valid learning path" },
        { status: 500 }
      );
    }

    const learningPath = buildLearningPath(parsed, topic.trim());
    return Response.json(learningPath);
  } catch (error) {
    console.error("[generate-path] Error:", error);
    return Response.json(
      { error: "Failed to generate learning path" },
      { status: 500 }
    );
  }
}

function buildCurriculumPrompt(topic: string): string {
  return `You are a curriculum designer. Create a structured learning path for the following topic:

"${topic}"

Return ONLY a valid JSON object (no markdown, no code fences, no extra text) with this exact structure:

{
  "topic": "Clean, well-formatted title for the topic",
  "description": "1-2 sentence description of what the learner will achieve",
  "steps": [
    {
      "step": 1,
      "title": "Short step title (3-6 words)",
      "objective": "What the learner will be able to do after this step",
      "hasExercise": true,
      "exerciseType": "question"
    }
  ],
  "estimatedMinutes": 45,
  "includesCode": false,
  "codeLanguage": null
}

Guidelines:
- Create 5-10 steps that build on each other progressively
- Start from the basics and advance gradually
- Each step should have a clear, specific learning objective
- Include exercises for most steps (hasExercise: true)
- For coding topics: set includesCode to true, set codeLanguage to the language name, and use exerciseType "code" for coding exercises
- For non-coding topics: set includesCode to false, codeLanguage to null, use exerciseType "question" or "creative"
- "creative" exercises are for tasks like writing, designing, brainstorming
- exerciseType must be one of: "code", "question", "creative"
- Estimate realistic total learning time in minutes
- Make it engaging and practical, not purely theoretical

Return ONLY the JSON object, nothing else.`;
}

function parseJsonFromText(text: string): Record<string, unknown> | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function buildLearningPath(
  parsed: Record<string, unknown>,
  fallbackTopic: string
): LearningPath {
  const rawSteps = parsed.steps as RawStep[];

  const steps: PathStep[] = rawSteps.map((s, i) => ({
    step: s.step || i + 1,
    title: s.title || `Step ${i + 1}`,
    objective: s.objective || "",
    hasExercise: s.hasExercise !== false,
    exerciseType: validateExerciseType(s.exerciseType),
  }));

  return {
    id: generateId(),
    topic: (parsed.topic as string) || fallbackTopic,
    description: (parsed.description as string) || "",
    steps,
    estimatedMinutes: (parsed.estimatedMinutes as number) || 30,
    includesCode: (parsed.includesCode as boolean) || false,
    codeLanguage: (parsed.codeLanguage as string) || undefined,
    createdAt: new Date().toISOString(),
  };
}

function validateExerciseType(
  type?: string
): "code" | "question" | "creative" {
  if (type === "code" || type === "question" || type === "creative") {
    return type;
  }
  return "question";
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

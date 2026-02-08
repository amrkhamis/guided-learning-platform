import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getCourse, buildTutorSystemPrompt } from "@/lib/courses";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, courseId, stepNumber, completedSteps, currentAttempt } =
    await req.json();

  const course = getCourse(courseId);
  if (!course) {
    return new Response("Course not found", { status: 404 });
  }

  const systemPrompt = buildTutorSystemPrompt(course, stepNumber, {
    completedSteps: completedSteps || [],
    currentAttempt: currentAttempt || 1,
  });

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}

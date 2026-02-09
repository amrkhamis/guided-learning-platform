"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSession } from "@/lib/sessions";
import type { LearningPath } from "@/lib/types";

function NewLearningContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get("topic") || "";

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePath = useCallback(async () => {
    if (!topic) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate learning path");
      }

      const data: LearningPath = await res.json();
      setLearningPath(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [topic]);

  useEffect(() => {
    if (topic) {
      generatePath();
    }
  }, [topic, generatePath]);

  const handleStartLearning = () => {
    if (!learningPath) return;
    createSession(learningPath);
    router.push(`/learn/${learningPath.id}`);
  };

  if (!topic) {
    router.push("/");
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Generating state */}
      {isGenerating && (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium">
              Creating your learning path...
            </span>
          </div>
          <p className="text-[var(--muted)]">
            Designing a personalized curriculum for &quot;{topic}&quot;
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-20">
          <p className="text-[var(--error)] mb-4">{error}</p>
          <button
            onClick={generatePath}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Preview state */}
      {learningPath && !isGenerating && (
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{learningPath.topic}</h2>
          <p className="text-[var(--muted)] mb-2">
            {learningPath.description}
          </p>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)] mb-8">
            <span>{learningPath.steps.length} steps</span>
            <span className="text-[var(--card-border)]">|</span>
            <span>~{learningPath.estimatedMinutes} min</span>
            {learningPath.includesCode && (
              <>
                <span className="text-[var(--card-border)]">|</span>
                <span className="capitalize">
                  {learningPath.codeLanguage || "Code"}
                </span>
              </>
            )}
          </div>

          {/* Steps preview */}
          <div className="space-y-3 mb-10">
            {learningPath.steps.map((step) => (
              <div
                key={step.step}
                className="flex gap-4 items-start rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-5 py-4"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
                <div>
                  <h4 className="font-medium mb-0.5">{step.title}</h4>
                  <p className="text-sm text-[var(--muted)]">
                    {step.objective}
                  </p>
                  {step.hasExercise && (
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-[var(--card-border)] text-[var(--muted)]">
                      {step.exerciseType === "code"
                        ? "Coding exercise"
                        : step.exerciseType === "creative"
                          ? "Creative exercise"
                          : "Practice question"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Start button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartLearning}
              className="px-8 py-3.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors text-base"
            >
              Start Learning
            </button>
            <button
              onClick={generatePath}
              className="px-6 py-3.5 rounded-xl border border-[var(--card-border)] text-sm hover:bg-[var(--card)] transition-colors"
            >
              Regenerate Path
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewLearningPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <a
            href="/"
            className="text-sm text-[var(--muted)] hover:text-white transition-colors"
          >
            &larr; Back
          </a>
          <h1 className="text-sm font-medium text-[var(--muted)]">
            New Learning Path
          </h1>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="text-center py-20 text-[var(--muted)]">
            Loading...
          </div>
        }
      >
        <NewLearningContent />
      </Suspense>
    </div>
  );
}

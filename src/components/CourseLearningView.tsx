"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Course } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { StepProgress } from "./StepProgress";
import { CodeEditor } from "./CodeEditor";
import {
  initCourseProgress,
  completeStep,
  recordAttempt,
  getCourseProgress,
} from "@/lib/progress";

interface CourseLearningViewProps {
  course: Course;
}

export function CourseLearningView({ course }: CourseLearningViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved progress on mount
  useEffect(() => {
    const saved = getCourseProgress(course.id);
    if (saved) {
      setCurrentStep(saved.currentStep);
      setCompletedSteps(
        saved.steps.filter((s) => s.completed).map((s) => s.stepNumber)
      );
      const currentStepProgress = saved.steps.find(
        (s) => s.stepNumber === saved.currentStep
      );
      setCurrentAttempt(currentStepProgress?.attempts || 1);
    } else {
      initCourseProgress(course.id, course.steps.length);
    }
    setIsLoaded(true);
  }, [course.id, course.steps.length]);

  const currentStepData = course.steps.find((s) => s.step === currentStep);
  const isCodeStep = currentStepData?.exercise.type === "code";

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({
      api: "/api/chat",
      body: {
        courseId: course.id,
        stepNumber: currentStep,
        completedSteps,
        currentAttempt,
      },
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content: `Welcome to **${course.title}**! I'll be your tutor for this course. We have ${course.steps.length} steps to work through together.\n\nLet's start with Step ${currentStep}: **${currentStepData?.title}**.\n\nReady to begin?`,
        },
      ],
    });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNextStep = () => {
    if (currentStep < course.steps.length) {
      const nextStep = currentStep + 1;
      const nextStepData = course.steps.find((s) => s.step === nextStep);
      setCompletedSteps((prev) => [...prev, currentStep]);
      completeStep(course.id, currentStep);
      setCurrentStep(nextStep);
      setCurrentAttempt(1);
      setShowEditor(false);

      append({
        role: "user",
        content: `I'm ready for the next step: Step ${nextStep} — ${nextStepData?.title}`,
      });
    }
  };

  const handleCodeSubmit = (code: string) => {
    recordAttempt(course.id, currentStep, code);
    append({
      role: "user",
      content: `I wrote this code for the exercise:\n\n\`\`\`python\n${code}\n\`\`\`\n\nPlease review it and let me know if it's correct.`,
    });
    setCurrentAttempt((prev) => prev + 1);
  };

  const courseCompleted =
    currentStep === course.steps.length &&
    completedSteps.length === course.steps.length - 1;

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--muted)]">
        Loading course...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-[var(--card-border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm text-[var(--muted)] hover:text-white transition-colors"
          >
            &larr; Courses
          </a>
          <h1 className="text-sm font-semibold">{course.title}</h1>
        </div>
        <StepProgress
          totalSteps={course.steps.length}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div
          className={`flex flex-col ${showEditor ? "w-1/2" : "w-full max-w-3xl mx-auto"} transition-all`}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-1 px-4 py-2">
                <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-[var(--card-border)] p-4">
            <div className="flex gap-2">
              {isCodeStep && (
                <button
                  onClick={() => setShowEditor(!showEditor)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg border border-[var(--card-border)] text-sm hover:bg-[var(--card)] transition-colors"
                  title="Toggle code editor"
                >
                  {showEditor ? "Hide Editor" : "Code Editor"}
                </button>
              )}
              <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your answer or ask a question..."
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Step navigation */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--card-border)]">
              <span className="text-xs text-[var(--muted)]">
                Step {currentStep} of {course.steps.length}:{" "}
                {currentStepData?.title}
              </span>
              {!courseCompleted ? (
                <button
                  onClick={handleNextStep}
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
                >
                  Next Step &rarr;
                </button>
              ) : (
                <span className="text-xs text-[var(--success)] font-medium">
                  Course completed!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Code editor panel */}
        {showEditor && (
          <div className="w-1/2 border-l border-[var(--card-border)] flex flex-col">
            <CodeEditor
              language={currentStepData?.exercise.language || "python"}
              onSubmit={handleCodeSubmit}
              hints={currentStepData?.exercise.hints}
            />
          </div>
        )}
      </div>
    </div>
  );
}

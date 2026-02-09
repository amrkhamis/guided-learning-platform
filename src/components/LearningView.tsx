"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { LearningSession } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { StepProgress } from "./StepProgress";
import { CodeEditor } from "./CodeEditor";
import { completeStep, recordAttempt } from "@/lib/sessions";

interface LearningViewProps {
  session: LearningSession;
}

export function LearningView({ session }: LearningViewProps) {
  const { learningPath } = session;

  const [currentStep, setCurrentStep] = useState(session.currentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    session.completedSteps
  );
  const [currentAttempt, setCurrentAttempt] = useState(session.currentAttempt);
  const [showEditor, setShowEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentStepData = learningPath.steps.find(
    (s) => s.step === currentStep
  );
  const showCodeEditor =
    learningPath.includesCode &&
    currentStepData?.hasExercise &&
    currentStepData?.exerciseType === "code";

  const sessionCompleted =
    currentStep === learningPath.steps.length &&
    completedSteps.length === learningPath.steps.length - 1;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    body: {
      learningPath,
      stepNumber: currentStep,
      completedSteps,
      currentAttempt,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Welcome! I'll be your tutor for **${learningPath.topic}**. We have ${learningPath.steps.length} steps to work through together.\n\nLet's start with Step ${currentStep}: **${currentStepData?.title}**.\n\nReady to begin?`,
      },
    ],
  });

  // Dynamic page title
  useEffect(() => {
    document.title = `${learningPath.topic} - Guided Learning`;
  }, [learningPath.topic]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNextStep = () => {
    if (currentStep < learningPath.steps.length) {
      const nextStep = currentStep + 1;
      const nextStepData = learningPath.steps.find(
        (s) => s.step === nextStep
      );
      setCompletedSteps((prev) => [...prev, currentStep]);
      completeStep(session.id, currentStep);
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
    recordAttempt(session.id);
    const lang = learningPath.codeLanguage || "code";
    append({
      role: "user",
      content: `I wrote this code for the exercise:\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\nPlease review it and let me know if it's correct.`,
    });
    setCurrentAttempt((prev) => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-[var(--card-border)] px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <a
            href="/"
            className="flex-shrink-0 text-sm text-[var(--muted)] hover:text-white transition-colors"
          >
            &larr;
            <span className="hidden sm:inline"> Home</span>
          </a>
          <h1 className="text-sm font-semibold truncate hidden sm:block">
            {learningPath.topic}
          </h1>
        </div>
        <StepProgress
          totalSteps={learningPath.steps.length}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </header>

      {/* Completion banner */}
      {sessionCompleted && (
        <div className="flex-shrink-0 bg-[var(--success)]/10 border-b border-[var(--success)]/20 px-4 py-4 sm:py-5 text-center">
          <div className="text-lg sm:text-xl font-bold mb-1">
            You completed {learningPath.topic}!
          </div>
          <p className="text-sm text-[var(--muted)] mb-3">
            {learningPath.steps.length} steps completed
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Start a New Topic
          </a>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat panel */}
        <div
          className={`flex flex-col ${showEditor ? "flex-1 md:w-1/2" : "w-full max-w-3xl mx-auto"} transition-all min-h-0`}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
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
            {/* Error + retry */}
            {error && (
              <div className="mx-1 p-3 rounded-lg bg-red-900/20 border border-red-800/30 flex items-center justify-between gap-3">
                <span className="text-sm text-red-300">
                  Failed to get a response.
                </span>
                <button
                  onClick={() => reload()}
                  className="flex-shrink-0 text-sm text-red-400 hover:text-red-300 font-medium"
                >
                  Retry
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-[var(--card-border)] p-3 sm:p-4">
            <div className="flex gap-2">
              {showCodeEditor && (
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
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Step navigation */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--card-border)]">
              <span className="text-xs text-[var(--muted)] truncate mr-2">
                Step {currentStep} of {learningPath.steps.length}:{" "}
                {currentStepData?.title}
              </span>
              {!sessionCompleted && (
                <button
                  onClick={handleNextStep}
                  className="flex-shrink-0 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
                >
                  Next Step &rarr;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Code editor panel -- side on desktop, bottom sheet on mobile */}
        {showEditor && showCodeEditor && (
          <div className="h-[40vh] md:h-auto md:w-1/2 border-t md:border-t-0 md:border-l border-[var(--card-border)] flex flex-col">
            <CodeEditor
              language={learningPath.codeLanguage || "python"}
              onSubmit={handleCodeSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

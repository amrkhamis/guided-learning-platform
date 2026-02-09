"use client";

interface StepProgressProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
}

export function StepProgress({
  totalSteps,
  currentStep,
  completedSteps,
}: StepProgressProps) {
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <div className="flex items-center gap-2">
      {/* Compact bar -- always visible on mobile, hidden on sm+ */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="w-16 h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-[var(--muted)]">
          {completedSteps.length}/{totalSteps}
        </span>
      </div>

      {/* Dots -- hidden on mobile, visible on sm+ */}
      <div className="hidden sm:flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;

          return (
            <div
              key={step}
              className={`w-8 h-1.5 rounded-full transition-colors ${
                isCompleted
                  ? "bg-[var(--success)]"
                  : isCurrent
                    ? "bg-[var(--primary)]"
                    : "bg-[var(--card-border)]"
              }`}
              title={`Step ${step}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
            />
          );
        })}
        <span className="ml-2 text-xs text-[var(--muted)]">
          {completedSteps.length}/{totalSteps}
        </span>
      </div>
    </div>
  );
}

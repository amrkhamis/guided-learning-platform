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
  return (
    <div className="flex items-center gap-1.5">
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
  );
}

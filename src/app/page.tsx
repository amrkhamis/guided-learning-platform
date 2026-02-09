"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessions, deleteSession } from "@/lib/sessions";
import type { LearningSession } from "@/lib/types";

const suggestedTopics = [
  { label: "Python Programming", icon: "🐍" },
  { label: "JavaScript Basics", icon: "⚡" },
  { label: "How to Cook Italian Food", icon: "🍝" },
  { label: "Basics of Investing", icon: "📈" },
  { label: "Music Theory Fundamentals", icon: "🎵" },
  { label: "Introduction to Photography", icon: "📷" },
  { label: "Creative Writing", icon: "✍️" },
  { label: "Machine Learning Concepts", icon: "🤖" },
  { label: "Public Speaking Skills", icon: "🎤" },
  { label: "Spanish for Beginners", icon: "🇪🇸" },
  { label: "Personal Finance 101", icon: "💰" },
  { label: "Web Design Principles", icon: "🎨" },
];

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSessions(getSessions());
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    router.push(`/learn/new?topic=${encodeURIComponent(topic.trim())}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/learn/new?topic=${encodeURIComponent(suggestion)}`);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteSession(id);
    setSessions(getSessions());
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <h1 className="text-xl font-bold">Guided Learning</h1>
          <span className="text-sm text-[var(--muted)]">
            Learn anything, guided by AI
          </span>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12">
        <h2 className="text-2xl sm:text-4xl font-bold mb-3 text-center">
          What do you want to learn today?
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted)] mb-8 text-center max-w-2xl mx-auto">
          Type any topic and get a personalized learning path with an AI tutor
          that guides you step by step.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Python, cooking, music theory..."
              className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-5 py-3.5 text-base focus:outline-none focus:border-[var(--primary)] transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!topic.trim()}
              className="px-6 py-3.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Learning
            </button>
          </div>
        </form>
      </section>

      {/* Suggested Topics */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <h3 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-4">
          Popular topics
        </h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {suggestedTopics.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSuggestionClick(item.label)}
              className="flex items-center gap-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm text-left hover:border-[var(--primary)] transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Empty library hint */}
      {isLoaded && sessions.length === 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-8">
          <p className="text-center text-sm text-[var(--muted)]">
            Your learning sessions will appear here
          </p>
        </section>
      )}

      {/* Learning Library */}
      {isLoaded && sessions.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h3 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-4">
            Your learning library
          </h3>
          <div className="space-y-2">
            {sessions.map((session) => {
              const totalSteps = session.learningPath.steps.length;
              const doneSteps = session.completedSteps.length;
              const progress = Math.round((doneSteps / totalSteps) * 100);
              const isComplete = !!session.completedAt;

              return (
                <a
                  key={session.id}
                  href={`/learn/${session.id}`}
                  className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-5 py-4 hover:border-[var(--primary)] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {session.learningPath.topic}
                      </h4>
                      {isComplete && (
                        <span className="flex-shrink-0 text-xs bg-[var(--success)]/20 text-[var(--success)] px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Step {session.currentStep} of {totalSteps} &middot;{" "}
                      {formatTimeAgo(session.lastAccessedAt)}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-shrink-0 w-16 sm:w-24">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isComplete ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {progress}%
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="flex-shrink-0 p-1.5 rounded text-[var(--muted)] hover:text-[var(--error)] sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    title="Delete session"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

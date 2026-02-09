"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/sessions";
import { LearningView } from "@/components/LearningView";
import type { LearningSession } from "@/lib/types";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";

  const [session, setSession] = useState<LearningSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setIsLoaded(true);
      return;
    }
    const saved = getSession(sessionId);
    if (saved) {
      setSession(saved);
    }
    setIsLoaded(true);
  }, [sessionId]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--muted)]">
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--muted)]">Session not found</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return <LearningView session={session} />;
}

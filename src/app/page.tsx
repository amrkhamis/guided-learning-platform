import Link from "next/link";
import { getCourses } from "@/lib/courses";

export default function HomePage() {
  const courses = getCourses();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <h1 className="text-xl font-bold">Guided Learning</h1>
          <span className="text-sm text-[var(--muted)]">
            AI-Powered Technical Courses
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-4xl font-bold mb-4">
          Learn by doing, guided by AI
        </h2>
        <p className="text-lg text-[var(--muted)] mb-12 max-w-2xl">
          Interactive courses where an AI tutor walks you through each concept
          one step at a time. Write real code, get instant feedback, and prove
          your understanding before moving on.
        </p>

        {/* Course Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">
                  {course.difficulty}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  ~{course.estimatedMinutes} min
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                {course.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>{course.steps.length} steps</span>
                <span className="text-[var(--card-border)]">|</span>
                <span className="capitalize">{course.language}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import { getCourse } from "@/lib/courses";
import { notFound } from "next/navigation";
import { CourseLearningView } from "@/components/CourseLearningView";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    notFound();
  }

  return <CourseLearningView course={course} />;
}

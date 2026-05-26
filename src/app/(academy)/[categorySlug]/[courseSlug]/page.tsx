import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategory, getCourse } from "@/lib/content";
import { prisma } from "@/lib/db";
import { LessonListItem } from "@/components/browse/LessonListItem";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ categorySlug: string; courseSlug: string }>;
}) {
  const { categorySlug, courseSlug } = await params;
  const category = getCategory(categorySlug);
  const course = getCourse(courseSlug);
  if (!category || !course) notFound();

  const session = await auth();
  const completions = session?.user?.id
    ? await prisma.taskCompletion.findMany({
        where: { userId: session.user.id, courseSlug: course.slug },
        select: { taskId: true },
      })
    : [];

  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-sm text-gray-500">{category.title}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          {course.title}
        </h1>
        <p className="text-gray-500 mt-2">{course.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
          <span>{course.estimatedMinutes} min</span>
          <span>{course.difficulty}</span>
          <span>{course.lessons.length} lessons</span>
        </div>
      </div>

      <div className="space-y-3">
        {course.lessons.map((lesson) => (
          <LessonListItem
            key={lesson.slug}
            lesson={lesson}
            categorySlug={categorySlug}
            courseSlug={courseSlug}
            completedTaskIds={completedTaskIds}
          />
        ))}
      </div>
    </div>
  );
}

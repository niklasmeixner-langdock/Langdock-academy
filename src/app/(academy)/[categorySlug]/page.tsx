import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategory, getCoursesByCategory } from "@/lib/content";
import { prisma } from "@/lib/db";
import { CourseCard } from "@/components/browse/CourseCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) notFound();

  const session = await auth();
  const courses = getCoursesByCategory(categorySlug);

  const completions = session?.user?.id
    ? await prisma.taskCompletion.findMany({
        where: { userId: session.user.id },
        select: { taskId: true, courseSlug: true },
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{category.title}</h1>
      <p className="text-gray-500 mt-1">{category.description}</p>

      <div className="mt-8 grid gap-4">
        {courses.map((course) => {
          const totalTasks = course.lessons.reduce(
            (sum, l) => sum + l.tasks.length,
            0
          );
          const completedTasks = completions.filter(
            (c) => c.courseSlug === course.slug
          ).length;

          return (
            <CourseCard
              key={course.slug}
              course={course}
              categorySlug={categorySlug}
              completed={completedTasks}
              total={totalTasks}
            />
          );
        })}
      </div>
    </div>
  );
}

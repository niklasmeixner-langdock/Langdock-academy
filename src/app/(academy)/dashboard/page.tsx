import { auth } from "@/lib/auth";
import { getCategories, getCoursesByCategory } from "@/lib/content";
import { prisma } from "@/lib/db";
import { CategoryCard } from "@/components/browse/CategoryCard";
import { GraduationCap } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const categories = getCategories();
  const completions = session?.user?.id
    ? await prisma.taskCompletion.findMany({
        where: { userId: session.user.id },
        select: { taskId: true },
      })
    : [];

  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Langdock Academy
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Learn how to get the most out of Langdock with hands-on courses and
            interactive exercises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((category) => {
            const courses = getCoursesByCategory(category.slug);
            const totalTasks = courses.flatMap((c) =>
              c.lessons.flatMap((l) => l.tasks)
            );
            const completedCount = totalTasks.filter((t) =>
              completedTaskIds.has(t.id)
            ).length;
            const percent =
              totalTasks.length > 0
                ? Math.round((completedCount / totalTasks.length) * 100)
                : 0;

            return (
              <CategoryCard
                key={category.slug}
                category={category}
                courseCount={courses.length}
                completionPercent={percent}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

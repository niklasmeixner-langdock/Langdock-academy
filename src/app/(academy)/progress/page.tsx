import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCourses } from "@/lib/content";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { BarChart3, Check } from "lucide-react";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const completions = await prisma.taskCompletion.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
  });

  const courses = getCourses();
  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  const courseStats = courses.map((course) => {
    const totalTasks = course.lessons.reduce(
      (sum, l) => sum + l.tasks.length,
      0
    );
    const completedTasks = course.lessons.reduce(
      (sum, l) =>
        sum + l.tasks.filter((t) => completedTaskIds.has(t.id)).length,
      0
    );

    return {
      course,
      completedTasks,
      totalTasks,
    };
  });

  const totalCompleted = completions.length;
  const totalTasks = courses.reduce(
    (sum, c) => sum + c.lessons.reduce((s, l) => s + l.tasks.length, 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
      </div>

      <div className="p-6 bg-white rounded-xl border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-900">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500">
            {totalCompleted}/{totalTasks} tasks
          </span>
        </div>
        <ProgressBar completed={totalCompleted} total={totalTasks} />
      </div>

      <div className="space-y-4">
        {courseStats.map(({ course, completedTasks, totalTasks }) => (
          <div
            key={course.slug}
            className="p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {course.title}
              </h3>
              <div className="flex items-center gap-2">
                {completedTasks === totalTasks && totalTasks > 0 && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
                <span className="text-xs text-gray-500">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
            </div>
            <ProgressBar completed={completedTasks} total={totalTasks} />
          </div>
        ))}
      </div>
    </div>
  );
}

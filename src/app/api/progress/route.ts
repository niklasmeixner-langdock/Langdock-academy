import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCourses } from "@/lib/content";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const completions = await prisma.taskCompletion.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
  });

  const courses = getCourses();
  const courseProgress = courses.map((course) => {
    const totalTasks = course.lessons.reduce(
      (sum, lesson) => sum + lesson.tasks.length,
      0
    );
    const completedTasks = completions.filter(
      (c) => c.courseSlug === course.slug
    ).length;

    return {
      courseSlug: course.slug,
      completed: completedTasks,
      total: totalTasks,
    };
  });

  return NextResponse.json({
    completions: completions.map((c) => ({
      taskId: c.taskId,
      courseSlug: c.courseSlug,
      lessonSlug: c.lessonSlug,
      completedAt: c.completedAt.toISOString(),
      verifiedVia: c.verifiedVia,
    })),
    courseProgress,
  });
}

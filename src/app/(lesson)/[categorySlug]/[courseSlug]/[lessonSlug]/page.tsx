import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLesson, getCourse, getCategory } from "@/lib/content";
import { prisma } from "@/lib/db";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonView } from "./LessonView";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ categorySlug: string; courseSlug: string; lessonSlug: string }>;
}) {
  const { categorySlug, courseSlug, lessonSlug } = await params;
  const category = getCategory(categorySlug);
  const course = getCourse(courseSlug);
  const lesson = getLesson(courseSlug, lessonSlug);
  if (!category || !course || !lesson) notFound();

  const session = await auth();

  const [completions, user] = await Promise.all([
    session?.user?.id
      ? prisma.taskCompletion.findMany({
          where: { userId: session.user.id, courseSlug },
          select: { taskId: true },
        })
      : [],
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { workspaceId: true },
        })
      : null,
  ]);

  const completedTaskIds = completions.map((c) => c.taskId);

  // Render MDX server-side, pass as React node to client LessonView
  const mdxContent = <LessonContent source={lesson.content} />;

  return (
    <LessonView
      lesson={lesson}
      mdxContent={mdxContent}
      completedTaskIds={completedTaskIds}
      workspaceId={user?.workspaceId ?? ""}
      langdockBaseUrl={process.env.NEXT_PUBLIC_LANGDOCK_APP_URL || "https://app.langdock.com"}
      breadcrumbs={[
        { label: category.title, href: `/${categorySlug}` },
        { label: course.title, href: `/${categorySlug}/${courseSlug}` },
        { label: lesson.title, href: `/${categorySlug}/${courseSlug}/${lessonSlug}` },
      ]}
    />
  );
}

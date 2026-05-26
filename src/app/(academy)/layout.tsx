import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategories, getCourses } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categories = getCategories();
  const courses = getCourses();

  const completions = session.user.id
    ? await prisma.taskCompletion.findMany({
        where: { userId: session.user.id },
        select: { taskId: true },
      })
    : [];

  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          categories={categories}
          courses={courses}
          completedTaskIds={completedTaskIds}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

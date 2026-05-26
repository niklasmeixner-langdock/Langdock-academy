import Link from "next/link";
import { Check, Circle, ChevronRight } from "lucide-react";
import type { Lesson } from "@/types/content";

interface LessonListItemProps {
  lesson: Lesson;
  categorySlug: string;
  courseSlug: string;
  completedTaskIds: Set<string>;
}

export function LessonListItem({
  lesson,
  categorySlug,
  courseSlug,
  completedTaskIds,
}: LessonListItemProps) {
  const completedTasks = lesson.tasks.filter((t) =>
    completedTaskIds.has(t.id)
  ).length;
  const totalTasks = lesson.tasks.length;
  const allDone = totalTasks > 0 && completedTasks === totalTasks;

  return (
    <Link
      href={`/${categorySlug}/${courseSlug}/${lesson.slug}`}
      className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div>
        {allDone ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {lesson.title}
        </h4>
        {lesson.description && (
          <p className="text-xs text-gray-500 mt-0.5">{lesson.description}</p>
        )}
        {totalTasks > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {completedTasks}/{totalTasks} tasks completed
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </Link>
  );
}

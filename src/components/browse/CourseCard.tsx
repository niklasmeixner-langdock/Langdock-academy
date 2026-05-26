import Link from "next/link";
import { Clock, BarChart3 } from "lucide-react";
import type { Course } from "@/types/content";
import { ProgressBar } from "../lesson/ProgressBar";

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

interface CourseCardProps {
  course: Course;
  categorySlug: string;
  completed: number;
  total: number;
}

export function CourseCard({ course, categorySlug, completed, total }: CourseCardProps) {
  return (
    <Link
      href={`/${categorySlug}/${course.slug}`}
      className="group block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[course.difficulty]}`}
        >
          {course.difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2">{course.description}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {course.estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3" />
          {course.lessons.length} lesson{course.lessons.length !== 1 ? "s" : ""}
        </span>
      </div>
      {total > 0 && (
        <div className="mt-3">
          <ProgressBar completed={completed} total={total} />
        </div>
      )}
    </Link>
  );
}

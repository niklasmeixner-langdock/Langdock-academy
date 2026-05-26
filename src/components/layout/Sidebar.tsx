"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import type { Category, Course } from "@/types/content";

interface SidebarProps {
  categories: Category[];
  courses: Course[];
  completedTaskIds: Set<string>;
}

export function Sidebar({ categories, courses, completedTaskIds }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  function toggleCategory(slug: string) {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  if (collapsed) {
    return (
      <div className="h-full border-r border-gray-200 bg-gray-50 flex flex-col items-center pt-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <nav className="w-56 shrink-0 h-full border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Courses
          </h2>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
        <ul className="space-y-1">
          {categories.map((category) => {
            const categoryCourses = courses.filter(
              (c) => c.categorySlug === category.slug
            );
            const isExpanded = expanded[category.slug] ?? false;

            return (
              <li key={category.slug}>
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  {category.title}
                </button>

                {isExpanded && (
                  <ul className="ml-4 mt-1 space-y-0.5">
                    {categoryCourses.map((course) => (
                      <li key={course.slug}>
                        <div className="px-2 py-1 text-xs font-medium text-gray-500">
                          {course.title}
                        </div>
                        <ul className="ml-2 space-y-0.5">
                          {course.lessons.map((lesson) => {
                            const lessonPath = `/${category.slug}/${course.slug}/${lesson.slug}`;
                            const isActive = pathname === lessonPath;
                            const allTasksDone =
                              lesson.tasks.length > 0 &&
                              lesson.tasks.every((t) =>
                                completedTaskIds.has(t.id)
                              );

                            return (
                              <li key={lesson.slug}>
                                <Link
                                  href={lessonPath}
                                  className={`flex items-center gap-2 px-2 py-1 text-sm rounded transition-colors ${
                                    isActive
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  {allTasksDone ? (
                                    <Check className="w-3 h-3 text-green-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-3 h-3 text-gray-400 shrink-0" />
                                  )}
                                  <span className="truncate">{lesson.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

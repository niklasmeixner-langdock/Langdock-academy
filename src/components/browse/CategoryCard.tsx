import Link from "next/link";
import { Bot, Shield, BookOpen, Plug, Folder } from "lucide-react";
import type { Category } from "@/types/content";

const iconMap: Record<string, React.ReactNode> = {
  bot: <Bot className="w-8 h-8" />,
  shield: <Shield className="w-8 h-8" />,
  book: <BookOpen className="w-8 h-8" />,
  plug: <Plug className="w-8 h-8" />,
  folder: <Folder className="w-8 h-8" />,
};

interface CategoryCardProps {
  category: Category;
  courseCount: number;
  completionPercent: number;
}

export function CategoryCard({ category, courseCount, completionPercent }: CategoryCardProps) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="text-blue-600 mb-4">
        {iconMap[category.icon] ?? <BookOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {category.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>{courseCount} course{courseCount !== 1 ? "s" : ""}</span>
        {completionPercent > 0 && (
          <span className="text-green-600 font-medium">{completionPercent}% complete</span>
        )}
      </div>
    </Link>
  );
}

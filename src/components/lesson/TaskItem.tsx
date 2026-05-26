"use client";

import type { Task } from "@/types/content";
import { Check, Circle, Loader2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  isVerifying: boolean;
  onVerify: () => void;
}

export function TaskItem({ task, isCompleted, isVerifying, onVerify }: TaskItemProps) {
  return (
    <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="mt-0.5">
        {isCompleted ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isCompleted ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        )}
      </div>
      {!isCompleted && (
        <button
          onClick={onVerify}
          disabled={isVerifying}
          className="shrink-0 px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isVerifying ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>
      )}
    </li>
  );
}

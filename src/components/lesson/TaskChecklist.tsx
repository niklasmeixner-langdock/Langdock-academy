"use client";

import type { Task } from "@/types/content";
import { TaskItem } from "./TaskItem";
import { ProgressBar } from "./ProgressBar";

interface TaskChecklistProps {
  tasks: Task[];
  completedTaskIds: Set<string>;
  onVerify: (taskId: string) => void;
  verifyingTaskId: string | null;
}

export function TaskChecklist({
  tasks,
  completedTaskIds,
  onVerify,
  verifyingTaskId,
}: TaskChecklistProps) {
  const completed = tasks.filter((t) => completedTaskIds.has(t.id)).length;

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
        <span className="text-xs text-gray-500">
          {completed}/{tasks.length} completed
        </span>
      </div>
      <ProgressBar completed={completed} total={tasks.length} />
      <ul className="mt-3 space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isCompleted={completedTaskIds.has(task.id)}
            isVerifying={verifyingTaskId === task.id}
            onVerify={() => onVerify(task.id)}
          />
        ))}
      </ul>
    </div>
  );
}

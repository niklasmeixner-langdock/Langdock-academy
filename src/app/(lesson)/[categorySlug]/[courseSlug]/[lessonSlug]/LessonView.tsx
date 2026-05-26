"use client";

import { useState, useCallback } from "react";
import type { Lesson } from "@/types/content";
import { TaskChecklist } from "@/components/lesson/TaskChecklist";
import { WorkspaceIframe } from "@/components/workspace/WorkspaceIframe";
import { useVerification } from "@/hooks/useVerification";

interface LessonViewProps {
  lesson: Lesson;
  mdxContent: React.ReactNode;
  completedTaskIds: string[];
  workspaceId: string;
  langdockBaseUrl: string;
  breadcrumbs: { label: string; href: string }[];
}

export function LessonView({
  lesson,
  mdxContent,
  completedTaskIds: initialCompleted,
  workspaceId,
  langdockBaseUrl,
  breadcrumbs,
}: LessonViewProps) {
  const [completedIds, setCompletedIds] = useState(new Set(initialCompleted));
  const [iframePath, setIframePath] = useState(lesson.iframeStartPath || "/");
  const [iframeCollapsed, setIframeCollapsed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const { verify, verifyingTaskId } = useVerification();

  const handleVerify = useCallback(
    async (taskId: string) => {
      setFeedbackMessage(null);
      const result = await verify(taskId);
      if (result.verified) {
        setCompletedIds((prev) => new Set([...prev, taskId]));
        setFeedbackMessage({ text: result.message, type: "success" });
      } else {
        setFeedbackMessage({ text: result.message, type: "error" });
      }
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    [verify]
  );

  return (
    <div className="h-full flex">
      {/* Content panel — expands when iframe is collapsed */}
      <div
        className={`${
          iframeCollapsed ? "flex-1" : "w-[500px] shrink-0"
        } border-r border-gray-200 flex flex-col h-full`}
      >
        <div className="px-6 py-3 border-b border-gray-200 text-xs text-gray-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href}>
              {i > 0 && " / "}
              <a href={crumb.href} className="hover:text-gray-900">
                {crumb.label}
              </a>
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={`prose ${iframeCollapsed ? "prose-base max-w-3xl mx-auto" : "prose-sm max-w-none"} p-6`}>
            {mdxContent}
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={`px-4 py-2 text-sm ${
              feedbackMessage.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

        {lesson.tasks.length > 0 && (
          <TaskChecklist
            tasks={lesson.tasks}
            completedTaskIds={completedIds}
            onVerify={handleVerify}
            verifyingTaskId={verifyingTaskId}
          />
        )}
      </div>

      {/* Workspace panel */}
      <div className={iframeCollapsed ? "" : "flex-1 min-w-0"}>
        <WorkspaceIframe
          workspaceId={workspaceId}
          baseUrl={langdockBaseUrl}
          path={iframePath}
          collapsed={iframeCollapsed}
          onToggleCollapse={() => setIframeCollapsed((c) => !c)}
        />
      </div>
    </div>
  );
}

"use client";

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitView({ left, right }: SplitViewProps) {
  return (
    <div className="h-full flex">
      <div className="w-[500px] shrink-0 border-r border-gray-200 overflow-y-auto">
        {left}
      </div>
      <div className="flex-1 min-w-0">
        {right}
      </div>
    </div>
  );
}

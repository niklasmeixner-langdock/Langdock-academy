"use client";

import { useState, useRef } from "react";
import {
  ExternalLink,
  RefreshCw,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

interface WorkspaceIframeProps {
  workspaceId: string;
  baseUrl: string;
  path?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function WorkspaceIframe({
  baseUrl,
  path = "/",
  collapsed = false,
  onToggleCollapse,
}: WorkspaceIframeProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeUrl = `${baseUrl}${path}`;

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center pt-3 bg-gray-50 border-l border-gray-200 px-1">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
          title="Show workspace"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <span className="text-[10px] text-gray-400 truncate mx-2">
          Langdock Workspace
        </span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
            title="Hide workspace"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <iframe
        key={refreshKey}
        ref={iframeRef}
        src={iframeUrl}
        className="flex-1 w-full border-0"
        allow="clipboard-write"
      />
    </div>
  );
}

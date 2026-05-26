"use client";

import { useState, useRef } from "react";
import {
  Loader2,
  AlertCircle,
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
  workspaceId,
  baseUrl,
  path = "/",
  collapsed = false,
  onToggleCollapse,
}: WorkspaceIframeProps) {
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeUrl = `${baseUrl}${path}`;

  function handleRefresh() {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

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

  if (!workspaceId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Workspace not connected
          </h3>
          <p className="text-gray-500 mb-4">
            Your Langdock workspace couldn&apos;t be detected. Make sure
            you&apos;re signed up with the same email in Langdock.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleRefresh}
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

      {/* Iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading workspace...</p>
            </div>
          </div>
        )}
        <iframe
          key={refreshKey}
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-0"
          allow="clipboard-write"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}

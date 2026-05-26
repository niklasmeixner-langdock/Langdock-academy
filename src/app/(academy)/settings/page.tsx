"use client";

import { useState, useEffect } from "react";
import { Settings, Check, Loader2, Building2, RefreshCw } from "lucide-react";

interface WorkspaceInfo {
  id: string;
  name: string | null;
  role: string;
}

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [allWorkspaces, setAllWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setWorkspace(data.workspace);
        setAllWorkspaces(data.allWorkspaces ?? []);
        setLoading(false);
      });
  }, []);

  async function handleSwitch(workspaceId: string) {
    setSwitching(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
    const res = await fetch("/api/settings");
    const data = await res.json();
    setWorkspace(data.workspace);
    setSwitching(false);
  }

  async function handleRefresh() {
    setLoading(true);
    const res = await fetch("/api/settings?refresh=true");
    const data = await res.json();
    setWorkspace(data.workspace);
    setAllWorkspaces(data.allWorkspaces ?? []);
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            Langdock Workspace
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Your workspace is automatically detected from your Langdock account.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading workspace...
          </div>
        ) : workspace ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  {workspace.name ?? "Unnamed workspace"}
                </p>
                <p className="text-xs text-green-600">
                  Connected as {workspace.role}
                </p>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              No Langdock workspace found for your email. Make sure you have an
              active Langdock account with the same email you used to sign in.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry detection
            </button>
          </div>
        )}

        {allWorkspaces.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Switch workspace
            </h3>
            <div className="space-y-2">
              {allWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws.id)}
                  disabled={switching || ws.id === workspace?.id}
                  className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                    ws.id === workspace?.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <Building2 className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {ws.name ?? "Unnamed workspace"}
                    </p>
                    <p className="text-xs text-gray-400">{ws.role}</p>
                  </div>
                  {ws.id === workspace?.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

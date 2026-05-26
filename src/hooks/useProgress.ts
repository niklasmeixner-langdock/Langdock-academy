"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProgressResponse } from "@/types/progress";

export function useProgress() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const completedTaskIds = new Set(
    data?.completions.map((c) => c.taskId) ?? []
  );

  return { data, loading, completedTaskIds, refetch: fetchProgress };
}

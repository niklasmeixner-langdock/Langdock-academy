"use client";

import { useState } from "react";
import type { VerifyResponse } from "@/types/progress";

export function useVerification(onSuccess?: () => void) {
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<VerifyResponse | null>(null);

  async function verify(taskId: string) {
    setVerifyingTaskId(taskId);
    setLastResult(null);

    try {
      const res = await fetch(`/api/verify/${taskId}`, { method: "POST" });
      const result: VerifyResponse = await res.json();
      setLastResult(result);

      if (result.verified) {
        onSuccess?.();
      }

      return result;
    } catch {
      const errorResult: VerifyResponse = {
        verified: false,
        message: "Verification request failed. Please try again.",
        taskId,
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setVerifyingTaskId(null);
    }
  }

  return { verify, verifyingTaskId, lastResult };
}

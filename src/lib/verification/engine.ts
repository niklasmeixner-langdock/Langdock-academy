import { prisma } from "../db";
import { getTaskById } from "../content";
import type { Verifier, VerificationResult } from "./types";
import { agentExistsVerifier } from "./verifiers/agent-exists";
import { knowledgeFolderExistsVerifier } from "./verifiers/knowledge-folder-exists";
import { integrationConnectedVerifier } from "./verifiers/integration-connected";
import { genericApiCheckVerifier } from "./verifiers/generic-api-check";

const verifierRegistry: Record<string, Verifier> = {
  "agent-exists": agentExistsVerifier,
  "knowledge-folder-exists": knowledgeFolderExistsVerifier,
  "integration-connected": integrationConnectedVerifier,
  "generic-api-check": genericApiCheckVerifier,
};

export async function verifyTask(
  taskId: string,
  userId: string
): Promise<VerificationResult & { completedAt?: string }> {
  const task = getTaskById(taskId);
  if (!task) {
    return { verified: false, message: "Task not found." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.workspaceId) {
    return {
      verified: false,
      message:
        "No Langdock workspace connected. Go to Settings to connect your workspace.",
    };
  }

  const verifier = verifierRegistry[task.verification.type];
  if (!verifier) {
    return {
      verified: false,
      message: `Unknown verification type: ${task.verification.type}`,
    };
  }

  const result = await verifier({
    userId,
    workspaceId: user.workspaceId,
    params: task.verification.params,
  });

  if (result.verified) {
    const completion = await prisma.taskCompletion.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: {
        userId,
        taskId,
        courseSlug: task.courseSlug,
        lessonSlug: task.lessonSlug,
        verifiedVia: "db",
      },
      update: {},
    });

    return {
      ...result,
      completedAt: completion.completedAt.toISOString(),
    };
  }

  return result;
}

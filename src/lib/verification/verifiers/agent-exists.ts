import { countAssistants } from "../../langdock-db";
import type { Verifier } from "../types";

export const agentExistsVerifier: Verifier = async (ctx) => {
  const minCount = (ctx.params.minCount as number) ?? 1;
  const count = await countAssistants(ctx.workspaceId);

  if (count >= minCount) {
    return { verified: true, message: `Found ${count} agent(s).` };
  }

  return {
    verified: false,
    message: `Need at least ${minCount} agent(s), found ${count}. Create an agent and try again.`,
  };
};

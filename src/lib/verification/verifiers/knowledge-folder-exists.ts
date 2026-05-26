import { countKnowledgeFolders } from "../../langdock-db";
import type { Verifier } from "../types";

export const knowledgeFolderExistsVerifier: Verifier = async (ctx) => {
  const minCount = (ctx.params.minCount as number) ?? 1;
  const count = await countKnowledgeFolders(ctx.workspaceId);

  if (count >= minCount) {
    return { verified: true, message: `Found ${count} knowledge folder(s).` };
  }

  return {
    verified: false,
    message: `Need at least ${minCount} knowledge folder(s), found ${count}. Add a knowledge folder and try again.`,
  };
};

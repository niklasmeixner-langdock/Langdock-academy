import { langdockDb } from "../../langdock-db";
import type { Verifier } from "../types";

/**
 * Generic verifier that runs a raw SQL query against the Langdock DB.
 * The query should return a count. Verification passes if count >= expectMinCount.
 *
 * params:
 *   - query: SQL query with $1 as workspace ID placeholder
 *   - expectMinCount: minimum count to pass (default 1)
 */
export const genericApiCheckVerifier: Verifier = async (ctx) => {
  const query = ctx.params.query as string;
  const expectMinCount = (ctx.params.expectMinCount as number) ?? 1;

  if (!query) {
    return { verified: false, message: "No verification query configured." };
  }

  try {
    const result = await langdockDb.$queryRawUnsafe<[{ count: bigint }]>(
      query,
      ctx.workspaceId
    );
    const count = Number(result[0]?.count ?? 0);

    if (count >= expectMinCount) {
      return { verified: true, message: "Verification passed." };
    }

    return {
      verified: false,
      message: "Verification failed. Complete the task and try again.",
    };
  } catch {
    return {
      verified: false,
      message: "Verification query failed.",
    };
  }
};

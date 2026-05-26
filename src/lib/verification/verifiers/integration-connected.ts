import { isIntegrationConnected } from "../../langdock-db";
import type { Verifier } from "../types";

export const integrationConnectedVerifier: Verifier = async (ctx) => {
  const integrationSlug = ctx.params.integrationSlug as string;
  const connected = await isIntegrationConnected(
    ctx.workspaceId,
    integrationSlug
  );

  if (connected) {
    return { verified: true, message: `${integrationSlug} is connected.` };
  }

  return {
    verified: false,
    message: `${integrationSlug} is not connected yet. Connect it and try again.`,
  };
};

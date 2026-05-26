export interface VerificationContext {
  userId: string;
  workspaceId: string;
  params: Record<string, unknown>;
}

export interface VerificationResult {
  verified: boolean;
  message: string;
}

export type Verifier = (ctx: VerificationContext) => Promise<VerificationResult>;

import { PrismaClient } from "@prisma/client";

/**
 * Direct read-only connection to the Langdock database.
 * Used to resolve workspace membership and verify task completion.
 *
 * The academy only reads — never writes — to Langdock tables.
 */
const langdockDbUrl =
  process.env.LANGDOCK_DATABASE_URL ||
  "postgresql://postgres:secret@localhost:5432/postgres";

const globalForLangdockDb = globalThis as unknown as {
  langdockDb: PrismaClient;
};

const langdockDb =
  globalForLangdockDb.langdockDb ||
  new PrismaClient({
    datasources: { db: { url: langdockDbUrl } },
  });

if (process.env.NODE_ENV !== "production")
  globalForLangdockDb.langdockDb = langdockDb;

export { langdockDb };

// ── Workspace resolution ────────────────────────────────────────────

export interface LangdockWorkspace {
  id: string;
  name: string | null;
  role: string;
}

export async function getWorkspacesForEmail(
  email: string
): Promise<LangdockWorkspace[]> {
  try {
    return await langdockDb.$queryRaw<LangdockWorkspace[]>`
      SELECT w.id::text, w.name, ou.role_id as role
      FROM users u
      JOIN org_users ou ON ou.user_id = u.id
      JOIN orgs w ON w.id = ou.org_id
      WHERE u.email = ${email}
        AND u.deleted_at IS NULL
        AND w.deleted_at IS NULL
        AND ou.active = true
      ORDER BY ou.created_at ASC
    `;
  } catch (error) {
    console.error("Failed to query Langdock DB for workspaces:", error);
    return [];
  }
}

// ── Verification queries ────────────────────────────────────────────

export async function countAssistants(workspaceId: string): Promise<number> {
  const result = await langdockDb.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM assistants
    WHERE org_id = ${workspaceId}::uuid
  `;
  return Number(result[0].count);
}

export async function countKnowledgeFolders(
  workspaceId: string
): Promise<number> {
  const result = await langdockDb.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM buckets
    WHERE org_id = ${workspaceId}::uuid
  `;
  return Number(result[0].count);
}

export async function isIntegrationConnected(
  workspaceId: string,
  integrationSlug: string
): Promise<boolean> {
  const result = await langdockDb.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM integration_connections ic
    JOIN integrations i ON i.id = ic.integration_id
    WHERE ic.org_id = ${workspaceId}::uuid
      AND i.slug = ${integrationSlug}
  `;
  return Number(result[0].count) > 0;
}

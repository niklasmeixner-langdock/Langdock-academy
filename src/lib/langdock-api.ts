const LANGDOCK_APP_URL =
  process.env.NEXT_PUBLIC_LANGDOCK_APP_URL || "https://app.langdock.com";
const LANGDOCK_API_BASE =
  process.env.LANGDOCK_API_BASE_URL || "https://api.langdock.com/v1";

export class LangdockApiClient {
  constructor(private apiKey: string) {}

  async get<T = unknown>(endpoint: string): Promise<{ data: T }> {
    const res = await fetch(`${LANGDOCK_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Langdock API error: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    return { data: data as T };
  }
}

export interface JoinableWorkspace {
  id: string;
  name: string | null;
  hexPrimaryColour: string | null;
  iconUrl: string | null;
  usersCount: number;
  isMember: boolean;
  isInvite: boolean;
}

/**
 * Fetch workspaces available to a user via the Langdock tRPC API.
 * Uses the internal tRPC batch endpoint — same as the web app's
 * workspace.getJoinableWorkspaces procedure.
 */
export async function fetchUserWorkspaces(
  apiKey: string
): Promise<JoinableWorkspace[]> {
  try {
    const client = new LangdockApiClient(apiKey);
    const { data } = await client.get<{ workspaces: JoinableWorkspace[] }>(
      "/workspaces"
    );
    return data.workspaces ?? [];
  } catch {
    return [];
  }
}

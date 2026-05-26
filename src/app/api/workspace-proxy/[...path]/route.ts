import { NextRequest } from "next/server";

const LANGDOCK_URL = process.env.NEXT_PUBLIC_LANGDOCK_APP_URL || "https://app.langdock.com";

/**
 * Reverse proxy to Langdock that strips frame-blocking headers.
 * The iframe points to /api/workspace-proxy/chat instead of app.langdock.com/chat.
 * Same-origin so cookies work, and we control the response headers.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = "/" + path.join("/");
  const targetUrl = new URL(targetPath, LANGDOCK_URL);

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Forward relevant request headers
  const headers = new Headers();
  const forwardHeaders = ["cookie", "accept", "accept-language", "user-agent", "content-type"];
  for (const h of forwardHeaders) {
    const val = request.headers.get(h);
    if (val) headers.set(h, val);
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers,
      redirect: "manual",
    });

    // Build response, stripping frame-blocking headers
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === "x-frame-options") return;
      if (lower === "content-security-policy") return;
      if (lower === "cross-origin-opener-policy") return;
      if (lower === "cross-origin-embedder-policy") return;

      // Rewrite Location headers to stay on proxy
      if (lower === "location") {
        const rewritten = value.replace(LANGDOCK_URL, "/api/workspace-proxy");
        responseHeaders.set(key, rewritten);
        return;
      }

      // Rewrite Set-Cookie domain
      if (lower === "set-cookie") {
        const fixed = value
          .replace(/;\s*Domain=[^;]*/gi, "")
          .replace(/;\s*Secure/gi, "")
          .replace(/;\s*SameSite=\w+/gi, "; SameSite=Lax");
        responseHeaders.append(key, fixed);
        return;
      }

      responseHeaders.set(key, value);
    });

    const body = res.body;
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response("Failed to reach Langdock", { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return GET(request, context);
}

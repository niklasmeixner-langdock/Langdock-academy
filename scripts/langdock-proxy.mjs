/**
 * Dev proxy that forwards requests to app.langdock.com
 * and strips frame-blocking headers so the academy can embed it.
 *
 * Usage: node scripts/langdock-proxy.mjs
 * Then set NEXT_PUBLIC_LANGDOCK_APP_URL=http://localhost:3001 in .env.local
 */

import http from "node:http";
import httpProxy from "http-proxy";

const TARGET = "https://app.langdock.com";
const PORT = process.env.PROXY_PORT || 3001;
const LOCAL_ORIGIN = `http://localhost:${PORT}`;

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  changeOrigin: true,
  secure: true,
  autoRewrite: true, // rewrite redirect Location headers
  cookieDomainRewrite: { "app.langdock.com": "localhost" },
});

proxy.on("proxyRes", (proxyRes) => {
  // Strip frame-blocking headers
  delete proxyRes.headers["x-frame-options"];
  delete proxyRes.headers["content-security-policy"];
  delete proxyRes.headers["cross-origin-opener-policy"];
  delete proxyRes.headers["cross-origin-embedder-policy"];

  // Rewrite Location headers so redirects stay on the proxy
  const location = proxyRes.headers["location"];
  if (location) {
    proxyRes.headers["location"] = location
      .replace("https://app.langdock.com", LOCAL_ORIGIN)
      .replace("http://app.langdock.com", LOCAL_ORIGIN);
  }

  // Rewrite Refresh headers (some redirects use these)
  const refresh = proxyRes.headers["refresh"];
  if (refresh) {
    proxyRes.headers["refresh"] = refresh
      .replace("https://app.langdock.com", LOCAL_ORIGIN)
      .replace("http://app.langdock.com", LOCAL_ORIGIN);
  }

  // Fix cookies: remove Secure flag and adjust domain for localhost
  const setCookie = proxyRes.headers["set-cookie"];
  if (setCookie) {
    proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
      cookie
        .replace(/;\s*Secure/gi, "")
        .replace(/;\s*SameSite=\w+/gi, "; SameSite=Lax")
        .replace(/;\s*Domain=[^;]*/gi, "")
    );
  }
});

proxy.on("error", (err, _req, res) => {
  console.error("Proxy error:", err.message);
  if (res.writeHead) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Proxy error — is app.langdock.com reachable?");
  }
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(PORT, () => {
  console.log(`Langdock proxy running on ${LOCAL_ORIGIN} → ${TARGET}`);
  console.log("Frame-blocking + redirect headers rewritten for academy embedding.");
});

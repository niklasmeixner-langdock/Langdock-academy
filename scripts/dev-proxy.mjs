/**
 * Dev proxy — single origin for academy + langdock.
 *
 *   http://localhost:4000/langdock/*  → localhost:3001 (strip /langdock)
 *   http://localhost:4000/*           → localhost:3000 (academy)
 *
 * Rewrites Langdock redirect headers to stay under /langdock.
 * Cookies work because everything is on localhost (same domain, port-agnostic).
 */

import http from "node:http";
import httpProxy from "http-proxy";

const ACADEMY_PORT = 3000;
const LANGDOCK_PORT = 3001;
const PROXY_PORT = 4000;

const academy = httpProxy.createProxyServer({
  target: `http://localhost:${ACADEMY_PORT}`,
  ws: true,
});

const langdock = httpProxy.createProxyServer({
  target: `http://localhost:${LANGDOCK_PORT}`,
  ws: true,
});

// Rewrite Langdock redirects to stay under /langdock
langdock.on("proxyRes", (proxyRes) => {
  const location = proxyRes.headers["location"];
  if (location) {
    let rewritten = location;
    // Absolute URL pointing to Langdock port → rewrite to /langdock path
    rewritten = rewritten.replace(
      `http://localhost:${LANGDOCK_PORT}`,
      `http://localhost:${PROXY_PORT}/langdock`
    );
    // Relative redirect (e.g. /login) → prepend /langdock
    if (rewritten.startsWith("/") && !rewritten.startsWith("/langdock")) {
      rewritten = "/langdock" + rewritten;
    }
    proxyRes.headers["location"] = rewritten;
  }

  // Rewrite refresh header too (some redirects use this)
  const refresh = proxyRes.headers["refresh"];
  if (refresh) {
    proxyRes.headers["refresh"] = refresh.replace(
      /url=\//g,
      "url=/langdock/"
    );
  }
});

// Error handlers — log but don't crash
academy.on("error", (err, _req, res) => {
  console.error("Academy proxy error:", err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Academy not reachable — is it running on port " + ACADEMY_PORT + "?");
  }
});

langdock.on("error", (err, _req, res) => {
  console.error("Langdock proxy error:", err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Langdock not reachable — is it running on port " + LANGDOCK_PORT + "?");
  }
});

const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/langdock")) {
    req.url = req.url.replace(/^\/langdock/, "") || "/";
    langdock.web(req, res);
  } else {
    academy.web(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/langdock")) {
    req.url = req.url.replace(/^\/langdock/, "") || "/";
    langdock.ws(req, socket, head);
  } else {
    academy.ws(req, socket, head);
  }
});

// Don't crash on uncaught errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in proxy:", err.message);
});

server.listen(PROXY_PORT, () => {
  console.log("");
  console.log("  Dev proxy ready: http://localhost:" + PROXY_PORT);
  console.log("");
  console.log("  1. Log into Langdock:  http://localhost:" + PROXY_PORT + "/langdock");
  console.log("  2. Open Academy:       http://localhost:" + PROXY_PORT + "/dashboard");
  console.log("");
});

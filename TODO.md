# Langdock Academy — Production TODO

## Blockers (must fix before going live)

### 1. CSP frame-ancestors change in Langdock main app
The academy embeds the Langdock workspace via iframe, but `app.langdock.com` sends `X-Frame-Options: DENY` which blocks embedding.

**Required change** in `Langdock/langdock` monorepo (`apps/web-app/`):

1. Add env var `ACADEMY_FRAME_ORIGINS` (e.g. `https://academy.langdock.com`)
2. In `src/pages/_document.tsx` (~line 67): read the env and pass to `buildCspHeader`:
   ```ts
   const academyOrigins = process.env.ACADEMY_FRAME_ORIGINS?.split(",") ?? [];
   const embedDomains = [
     ...((ctx.res as EmbedDomainsResponse)?.__embedDomains ?? []),
     ...academyOrigins,
   ].filter(Boolean);
   ```
3. In `src/proxy.ts` (~line 466): same — pass `academyOrigins` to `frameAncestors`
4. Remove the `X-Frame-Options: DENY` header when `academyOrigins` is set (line ~93 in `_document.tsx`, line ~471 in `proxy.ts`)

The CSP infrastructure already supports this via `frameAncestors` param in `buildCspHeader()` (`src/utils/csp.ts`).

**For local dev**: install the "Ignore X-Frame-Options Header" Chrome extension and enable it. The iframe points directly to `app.langdock.com` where you're already logged in — the extension bypasses the frame-blocking header so it loads in the iframe.

### 2. Google/Microsoft OAuth redirect URIs
- Current dev OAuth client only has `http://localhost:3000` as redirect URI
- For production, create a dedicated OAuth client (or add redirect URIs) for `https://academy.langdock.com/api/auth/callback/google` and `/callback/microsoft-entra-id`
- Update `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_*` in production env

### 3. Langdock DB access in production
- The academy reads the Langdock DB directly (read-only) for workspace resolution and task verification
- In production, set `LANGDOCK_DATABASE_URL` to a read replica or the main DB with a read-only user
- Consider creating a dedicated Postgres role with SELECT-only permissions on: `users`, `org_users`, `orgs`, `assistants`, `buckets`, `integration_connections`, `integrations`

### 4. Domain & deployment
- Set up `academy.langdock.com` subdomain
- Deploy to Railway (configured in project)
- Set all env vars in Railway dashboard (see `.env.example`)
- Run `npx prisma migrate deploy` against production DB

---

## Should fix (quality / UX)

### 5. Iframe SSO / shared session
- Currently the iframe shows the Langdock login page — user has to log in again inside the iframe
- **In production**: both apps under `*.langdock.com` → cookies shared automatically, no double-login
- **In local dev**: open `http://localhost:3001` in a new tab and log in there first — the iframe then picks up the session cookie
- OAuth callback redirects escape the dev proxy (goes to `app.langdock.com` directly), which is why logging in inside the iframe doesn't work locally

### 6. Remove dev proxy for production
- `scripts/langdock-proxy.mjs` is a dev-only workaround for CSP
- Once blocker #1 is resolved, set `NEXT_PUBLIC_LANGDOCK_APP_URL=https://app.langdock.com` directly
- Remove proxy from `package.json` scripts

### 7. Encrypt sensitive data
- `AUTH_SECRET` must be a strong random value in production (`openssl rand -base64 32`)
- Ensure DB connection strings aren't exposed in client bundles

### 8. Real course content
- Currently 1 sample course ("Getting Started with Agents")
- Need actual training content for all categories (Admin, Agents, Knowledge, Integrations, etc.)
- Content is in `content/` directory — MDX files, no code changes needed to add courses

---

## Nice to have (V2)

- [ ] PostMessage communication with Langdock iframe (real-time task completion events)
- [ ] Auto-polling verification (instead of manual "Verify" button)
- [ ] Content editing GUI (Keystatic or similar)
- [ ] Gamification (badges, streaks, leaderboards)
- [ ] Admin dashboard with analytics (completion rates, drop-off points)
- [ ] Search across courses
- [ ] Learning paths / prerequisites between courses
- [ ] Mobile-optimized layout (tab switcher for content vs workspace)
- [ ] Multi-language support
- [ ] Video content embedding in lessons

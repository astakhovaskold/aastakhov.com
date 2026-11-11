# Design

## Context

See `proposal.md` for background and motivation.

Currently, `aastakhov.com` exposes an MCP server through `@payloadcms/plugin-mcp` at `/api/mcp` and custom OAuth 2.0 endpoints under `/oauth/*` and `/.well-known/*`. These endpoints are designed to integrate with AI tools like ChatGPT Connectors, Claude Desktop, and local agents (Codex, Cursor). However, access tokens expire in 15 minutes with no refresh mechanism, CORS and preflight handling are absent, and client/origin assumptions are rigid. Furthermore, no client-side WebMCP integration exists for browser-based assistants.

## Goals / Non-Goals

**Goals:**
- Provide a robust OAuth 2.0 authorization code flow with PKCE and refresh token rotation (`grant_type=refresh_token`) to maintain persistent sessions for ChatGPT and AI connectors.
- Add comprehensive CORS preflight (`OPTIONS`) and response headers across all MCP and OAuth endpoints so browser-based AI clients (including ChatGPT Web) succeed without cross-origin blocks.
- Establish a hybrid access model: allow unauthenticated public read-only MCP access to published content (posts, projects, open-source, CV), while restricting write operations (create, update) strictly to authenticated editors.
- Implement client-side WebMCP Site Tools (`navigator.modelContext`) and declarative HTML annotations on the public Next.js frontend for live browser-agent interaction.
- Ensure environment resilience across production (`www.aastakhov.com`), staging/preview URLs, and local development (`localhost:3000`).

**Non-Goals:**
- Allowing unauthenticated write or mutation operations under any circumstances.
- Implementing arbitrary third-party OAuth provider login (GitHub, Google) for general public readers; authentication remains focused on the site administrator/editor.
- Exposing private, draft, or administrative collections (such as `users` or `payload-mcp-api-keys`) to unauthenticated callers.

## Decisions

### 1. Refresh Token Storage & Rotation in `mcp-oauth-codes`
- **Choice**: Extend the existing `mcp-oauth-codes` collection (or rename conceptually to handle tokens) to store hashed refresh tokens with expiration and single-use invalidation.
- **Rationale**: Reuses the established cryptographic hash pattern (`sha256base64url`) preventing plain-text token leaks from database dumps. Rotation invalidates the previous refresh token upon each exchange, protecting against replay attacks.
- **Alternative considered**: Storing refresh tokens in a separate JWT without database backing. Rejected because server-side revocation and replay detection are required for secure OAuth 2.0 rotation.

### 2. Dynamic Origin and Audience Resolution
- **Choice**: Determine request origin dynamically using `x-forwarded-proto` and `x-forwarded-host` (or `host`), falling back to `MCP_PUBLIC_ORIGIN`.
- **Rationale**: Hardcoding `https://www.aastakhov.com` breaks testing in local development (`localhost:3000`) and Vercel preview environments.
- **Alternative considered**: Requiring multiple environment variables per deployment environment. Rejected because dynamic header detection is zero-config and reliable behind Vercel/Next.js proxies.

### 3. Dedicated CORS & OPTIONS Middleware / Route Layer
- **Choice**: Implement explicit CORS headers and `OPTIONS` handling on `/oauth/authorize`, `/oauth/token`, `/.well-known/*`, and `/api/mcp`. For `/api/mcp`, wrap or complement Payload's endpoint with a Next.js App Router route or Next.js middleware that handles preflight `OPTIONS` requests before passing POST requests to the MCP handler.
- **Rationale**: Payload's plugin registers GET and POST for `/mcp`, but does not handle `OPTIONS` preflight, causing browser `fetch` calls from web clients to fail before reaching authentication.
- **Alternative considered**: Handling CORS only in `next.config.ts` headers. Rejected because `OPTIONS` requests to Next.js routes require explicit 200/204 status response handling, which headers configuration alone does not fully satisfy for all router configurations.

### 4. Hybrid Capability Resolution in `overrideAuth`
- **Choice**: When a request to `/api/mcp` has no `Authorization` header or an unauthenticated session, return a restricted set of read-only capabilities scoped to published documents:
  - `posts: { find: true }`
  - `projects: { find: true }`
  - `openSource: { find: true }`
  - `postCategories: { find: true }`
  - `media: { find: true }`
  - `cv: { find: true }`
  - `siteSettings: { find: true }`
  When an authenticated user token or valid API key is present, return full editorial capabilities (`find`, `create`, `update`).
- **Rationale**: Allows external AI tools and casual search agents to query the public blog, portfolio, and CV without needing credentials, while guaranteeing editorial security for mutations.
- **Alternative considered**: Requiring an API key for all read requests. Rejected because it blocks open discovery by ChatGPT Web and public AI search agents.

### 5. Client-Side WebMCP Provider Component
- **Choice**: Build a lightweight Next.js client component (`WebMcpProvider`) mounted in the root locale layout that safely detects `navigator.modelContext` / `window.modelContext` and registers tools (`search_content`, `get_article`, `get_cv`, `list_projects`). Additionally, add declarative attributes (`toolname`, `tooldescription`) to primary search forms and a `<link rel="model-context" href="/api/mcp">` tag in the `<head>`.
- **Rationale**: Enables both imperative WebMCP (for browser engines supporting the experimental standard) and declarative/link discovery (for crawler/browsing agents like ChatGPT Web).
- **Alternative considered**: Relying solely on remote backend MCP. Rejected because WebMCP provides instant, contextual browser tab interaction without external OAuth configuration.

## Risks / Trade-offs

- **[Risk] High query volume on public unauthenticated MCP read operations** → *Mitigation*: Ensure Payload queries for public read filter by published documents and enforce default pagination limits (`limit: 10`). Rate limiting can be enforced at the Vercel edge.
- **[Risk] OAuth token theft via browser extensions** → *Mitigation*: Refresh tokens are hashed in storage, rotated on every refresh, have finite lifetimes (30 days), and are bound to the client ID.
- **[Risk] Browser WebMCP API evolution** → *Mitigation*: Use defensive feature detection (`if (typeof window !== 'undefined' && 'modelContext' in navigator)`) so browsers without WebMCP support suffer zero performance or runtime penalties.

## Migration Plan

1. Update database schema for `mcp-oauth-codes` using Payload migration tool (`pnpm payload migrate:create`).
2. Deploy the backend changes to staging/preview to verify OAuth code exchange, refresh token rotation, and CORS preflight with ChatGPT Connector and local curl/test clients.
3. Test public unauthenticated read tool execution on `/api/mcp`.
4. Deploy to production and run database migration (`pnpm payload migrate`).
5. Verify WebMCP site tools in a Chromium browser with WebMCP flags enabled or via browser agent inspection.

# Tasks

## 1. Database & OAuth Refresh Token Core

- [x] 1.1 Update `McpOAuthCodes` collection schema to store `refreshTokenHash`, `refreshTokenExpiresAt`, and `refreshTokenUsedAt`, generate Payload types with `pnpm payload generate:types`, and create a Payload migration. Verify migration file is created and types build without error.
- [x] 1.2 Implement refresh token issuance, rotation logic, dynamic request origin resolution, and flexible client ID/scope validation in `src/lib/mcp-oauth.ts`. Verify helper functions correctly sign and verify both access and refresh tokens.
- [x] 1.3 Update `src/app/oauth/token/route.ts` to support `grant_type=refresh_token`, issuing new access/refresh pairs while revoking previous tokens. Verify code exchange and refresh rotation via curl.
- [x] 1.4 Update `src/app/oauth/authorize/route.ts` to redirect unauthenticated browser sessions to `/admin/login` preserving the return URL, then display the consent screen upon authentication. Verify redirection behavior with unauthenticated and authenticated sessions.

## 2. CORS Preflight & Transport Layer

- [x] 2.1 Implement shared CORS headers and `OPTIONS` preflight handlers on `/oauth/token`, `/oauth/authorize`, and `/.well-known/*` route handlers. Verify `curl -I -X OPTIONS` returns 204 with required `Access-Control-Allow-Origin` and allowed methods.
- [x] 2.2 Add CORS preflight and response headers for `/api/mcp` endpoint (via Payload endpoint config or App Router route wrapper). Verify `curl -I -X OPTIONS /api/mcp` returns 200/204 with CORS headers.

## 3. Hybrid Access Control in Payload MCP

- [x] 3.1 Update `overrideAuth` in `src/payload.config.ts` to return public read capabilities for published posts, projects, open-source records, and CV when unauthenticated. Verify unauthenticated MCP `find` tools return published documents.
- [x] 3.2 Ensure `create` and `update` MCP tools remain protected and require valid editor OAuth tokens or API keys. Verify unauthenticated create/update calls are rejected.

## 4. Client-Side WebMCP Integration

- [x] 4.1 Create `src/components/webmcp/WebMcpProvider.tsx` client component that safely detects `navigator.modelContext` / `window.modelContext` and registers `search_content`, `get_article`, `get_cv`, and `list_projects` tools. Verify tool registration mounts without SSR errors.
- [x] 4.2 Add declarative HTML tool annotations (`toolname`, `tooldescription`) to search components and `<link rel="model-context" href="/api/mcp">` in the root layout `<head>`. Verify annotations exist in rendered page markup.
- [x] 4.3 Implement internal search helper route `/api/webmcp/search` supporting multi-locale queries (`ru` and `en`) to back WebMCP tool executions. Verify querying with locale returns expected results.

## 5. Verification & Documentation

- [x] 5.1 Perform end-to-end verification of OAuth code flow, refresh token rotation, unauthenticated MCP tool calls, and authenticated editor tool calls. Verify all checks succeed.
- [x] 5.2 Update `docs/payload-mcp.md` to document OAuth refresh tokens, ChatGPT Web connector configuration, and WebMCP browser features. Verify documentation matches implementation.

# Proposal

## Why

The current MCP and OAuth setup for `aastakhov.com` suffers from frequent disconnections and compatibility failures when used by AI agents (e.g. Claude Desktop, Cursor, Codex) and ChatGPT (Web). Specifically:
1. OAuth access tokens expire after 15 minutes with no refresh token mechanism, causing ChatGPT connections to drop and require manual re-linking.
2. Missing CORS headers and `OPTIONS` preflight handling on `/api/mcp` and OAuth endpoints block browser-based AI clients (including ChatGPT Web).
3. Hardcoded client ID, static host assumptions, and strict scope matching reject standard OAuth handshakes from modern AI connectors.
4. There is no client-side WebMCP (Web Model Context Protocol / Site Tools) integration, preventing browser-based AI assistants from interacting directly with page content and site tools.

Resolving these issues will make content on `aastakhov.com` seamlessly discoverable, readable, and editable through AI agents and ChatGPT via both remote MCP and browser-native WebMCP.

## What Changes

- **OAuth 2.0 Resilience**: Add refresh token support (`grant_type=refresh_token`), extended session lifetimes, and flexible client/redirect/scope handling for ChatGPT and external AI connectors.
- **CORS & Preflight Handling**: Implement CORS preflight (`OPTIONS`) and headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`) across `/api/mcp`, `/oauth/*`, and `/.well-known/*`.
- **Hybrid Content Access Model**: Provide unauthenticated read-only access to published public content (posts, projects, open-source, CV, site settings), while strictly requiring authenticated Admin/Editor credentials (via OAuth or API Key) for create, update, and draft operations.
- **OAuth Authorization Flow UX**: Redirect unauthenticated browser sessions to `/admin/login` with post-login redirect back to the authorization consent screen.
- **WebMCP Browser Site Tools**: Embed client-side WebMCP (`navigator.modelContext` and declarative site tools) into the website frontend so browser AI agents (ChatGPT Web browsing, Chrome WebMCP) can discover and query articles, projects, open-source repositories, and the CV.
- **Dynamic Origin & Environment Support**: Support local development (`localhost`), Vercel preview environments, and production domains dynamically for OAuth issuer/audience checks.

## Capabilities

### New Capabilities
- `mcp-server`: Stable backend Model Context Protocol endpoint supporting OAuth 2.0 with refresh tokens, API keys, CORS preflight, and hybrid read/write content operations.
- `webmcp-integration`: In-browser Web Model Context Protocol (Site Tools) integration exposing structured content search, article retrieval, project discovery, and CV data to browser-based AI agents.

### Modified Capabilities
*(None; this is the initial OpenSpec specification for MCP and WebMCP)*

## Impact

- **Backend / API**:
  - `src/payload.config.ts`: Updated `mcpPlugin` configuration and access rules for hybrid public-read and authenticated-write.
  - `src/lib/mcp-oauth.ts`: Refresh token generation, validation, dynamic origin detection, and flexible client validation.
  - `src/app/oauth/token/route.ts`: Support for `grant_type=refresh_token` and CORS headers.
  - `src/app/oauth/authorize/route.ts`: Login redirect for unauthenticated sessions and CORS/OPTIONS support.
  - `src/app/api/mcp/route.ts` (or Payload MCP endpoint wrapper): CORS preflight and headers.
  - `src/collections/McpOAuthCodes.ts`: Add refresh token storage and expiry tracking.
- **Database / Migrations**:
  - New or updated Payload migration for `mcp-oauth-codes` (or `mcp-oauth-tokens`) to store hashed refresh tokens and issuance metadata.
- **Frontend / Client**:
  - Client component or script injecting WebMCP tool declarations into `window` / `navigator.modelContext` and rendering declarative HTML forms/metadata.
- **Documentation**:
  - Update `docs/payload-mcp.md` to document OAuth refresh tokens, ChatGPT setup, and WebMCP usage.

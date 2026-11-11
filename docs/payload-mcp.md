# Model Context Protocol (MCP) & WebMCP

The website content can be accessed and edited by AI agents and LLM clients through two complementary interfaces:
1. **Remote MCP Server (`/api/mcp`)**: Streamable HTTP endpoint for external agents (ChatGPT Connectors, Claude Desktop, Cursor, Codex).
2. **In-Browser WebMCP (Site Tools)**: Client-side integration for browser-based agents and ChatGPT Web browsing mode via `navigator.modelContext` and semantic HTML annotations.

---

## 1. Access Model & Permissions

Access follows a **hybrid model**:
- **Public / Unauthenticated**: Can discover and read published articles, projects, open-source records, CV, and site settings.
- **Authenticated Editor (OAuth / API Key)**: Required for creating or updating content. Deletion is disabled across all entities.

| Entity | Public MCP | Editor MCP (OAuth / API Key) |
| --- | --- | --- |
| Posts (`posts`) | find (published) | find, create, update |
| Projects (`projects`) | find (published) | find, create, update |
| Open Source (`open-source`) | find (published) | find, create, update |
| Post Categories (`post-categories`) | find only | find only |
| Media (`media`) | find only | find only |
| CV (`cv`) | find only | find, update |
| Site Settings (`site-settings`) | find only | find only |
| All entities | delete disabled | delete disabled |

---

## 2. ChatGPT Web & AI Connector (OAuth 2.0)

ChatGPT (Web and Apps) connects using the OAuth 2.0 Authorization Code flow with PKCE and Refresh Token rotation.

### Endpoint URLs
- **Authorization Endpoint**: `https://www.aastakhov.com/oauth/authorize`
- **Token Endpoint**: `https://www.aastakhov.com/oauth/token`
- **MCP Server URL**: `https://www.aastakhov.com/api/mcp`
- **Discovery**:
  - `https://www.aastakhov.com/.well-known/oauth-authorization-server`
  - `https://www.aastakhov.com/.well-known/oauth-protected-resource`

### OAuth Configuration in ChatGPT
1. **Client ID**: `aastakhov-payloadcms` (or custom client ID configured via `MCP_OAUTH_CLIENT_ID`)
2. **Scopes**: `content:read content:write`
3. **PKCE**: Enabled (S256)
4. **Token Refresh**: The token endpoint automatically issues and rotates cryptographically hashed refresh tokens (`grant_type=refresh_token`) valid for 30 days. Access tokens last 1 hour, preventing session disconnects.

---

## 3. Direct API Key Configuration (Claude, Cursor, Codex)

For personal agent workflows on a local machine without OAuth:

1. In Payload Admin, navigate to **MCP → API Keys** and generate a key while logged in as an admin/editor.
2. Configure your client (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "askold-content": {
      "type": "http",
      "url": "https://www.aastakhov.com/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_MCP_API_KEY>"
      }
    }
  }
}
```

---

## 4. WebMCP (In-Browser Site Tools)

When a browser agent visits `aastakhov.com`:
- **`navigator.modelContext` / `window.modelContext`**:
  - `search_content({ query, locale, type })`: Searches across articles, projects, and repositories.
  - `get_cv_summary({ locale })`: Returns Askold's background, summary, and skills.
  - `list_recent_posts({ locale })`: Returns recent blog posts.
  - `list_projects({ locale })`: Returns selected projects.
- **Backend Search Helper**: Available at `GET /api/webmcp/search?query=...&locale=ru|en`.
- **Discovery Links**: `<link rel="model-context" href="/api/mcp">` and `<link rel="webmcp" href="/api/webmcp/search">` are embedded in the `<head>`.
- **CORS**: Full CORS preflight (`OPTIONS`) and headers are enabled across all endpoints.

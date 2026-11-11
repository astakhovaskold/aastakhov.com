# Spec Delta

## Purpose

Provides a robust, standards-compliant Model Context Protocol (MCP) server over HTTP with OAuth 2.0 authorization, refresh token rotation, CORS support, and hybrid access controls for AI agents and ChatGPT.

## ADDED Requirements

### Requirement: OAuth 2.0 Authorization Code with PKCE
The authorization server MUST support OAuth 2.0 authorization code flow with PKCE S256 for ChatGPT and AI connectors, redirecting unauthenticated browser sessions to the admin login before granting consent.

#### Scenario: Unauthenticated user requests authorization
- **WHEN** an unauthenticated client requests `/oauth/authorize` with valid query parameters
- **THEN** the system redirects the browser to the login page with a return URL preserved for post-login consent

#### Scenario: Authenticated user grants authorization
- **WHEN** an authenticated user submits the consent form on `/oauth/authorize`
- **THEN** the system generates an authorization code bound to the user and redirects to the client redirect URI with code and state

### Requirement: OAuth Token Issuance and Refresh Token Rotation
The token endpoint MUST issue both an access token and a cryptographically secure refresh token upon valid code exchange, and MUST support exchanging a valid refresh token for a new access token and rotated refresh token via `grant_type=refresh_token`.

#### Scenario: Code exchange returns access and refresh tokens
- **WHEN** a client issues a POST to `/oauth/token` with `grant_type=authorization_code`, matching `code_verifier`, and valid code
- **THEN** the system responds with HTTP 200 containing `access_token`, `refresh_token`, `token_type: "Bearer"`, and `expires_in`

#### Scenario: Refresh token exchange rotates credentials
- **WHEN** a client issues a POST to `/oauth/token` with `grant_type=refresh_token` and an active refresh token
- **THEN** the system invalidates the used refresh token and returns a new access token and a newly generated refresh token

#### Scenario: Expired or reused refresh token is rejected
- **WHEN** a client issues a POST to `/oauth/token` with an expired or already revoked refresh token
- **THEN** the system responds with HTTP 400 and `error: "invalid_grant"`

### Requirement: CORS Preflight and Headers for MCP and OAuth Endpoints
The server MUST handle HTTP `OPTIONS` preflight requests and include permissive Cross-Origin Resource Sharing (CORS) headers on `/api/mcp`, `/oauth/*`, and `/.well-known/*` endpoints to allow web clients and ChatGPT Web to communicate without browser security errors.

#### Scenario: CORS preflight request
- **WHEN** a browser client sends an HTTP `OPTIONS` request to `/api/mcp` or `/oauth/token`
- **THEN** the server returns HTTP 204 or 200 with appropriate `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`

#### Scenario: Cross-origin MCP request
- **WHEN** a web client from an external origin sends an authorized POST request to `/api/mcp`
- **THEN** the response includes `Access-Control-Allow-Origin` allowing the client to read the response

### Requirement: Flexible Client ID and Scope Negotiation
The authorization and token endpoints MUST validate known AI clients and connector patterns gracefully, accepting standard scope representations without failing on whitespace variations or supported sub-scopes.

#### Scenario: Client requests standard scopes with whitespace variation
- **WHEN** an OAuth client requests scopes containing `content:read` or `content:write` in any standard delimiter format
- **THEN** the server accepts the recognized scopes and grants the matching permissions

### Requirement: Hybrid Access Control for Content Tools
The MCP server MUST expose public read-only content operations (find posts, projects, open-source records, CV, site settings) without requiring an admin token, while requiring valid editor authentication (OAuth token or API key) for creating or updating content.

#### Scenario: Unauthenticated agent finds published posts
- **WHEN** an unauthenticated client invokes the find post tool via MCP
- **THEN** the MCP server executes the find operation returning only published content

#### Scenario: Unauthenticated agent attempts content mutation
- **WHEN** an unauthenticated client invokes a create or update tool on posts or projects
- **THEN** the MCP server rejects the operation with an authorization error

#### Scenario: Authenticated editor creates a draft post
- **WHEN** an agent authenticated with a valid editor OAuth token or API key invokes the create post tool
- **THEN** the MCP server creates the post associated with the authenticated editor

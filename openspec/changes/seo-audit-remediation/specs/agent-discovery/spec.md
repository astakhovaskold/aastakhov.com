# Spec Delta

## Purpose

Defines the crawler-facing and agent-facing files the site publishes so search crawlers, AI crawlers and generic MCP clients can find the site's content and interfaces and read its usage preferences.

## ADDED Requirements

### Requirement: Content signals repeated per AI crawler group
Wherever `robots.txt` defines a named crawler group, that group SHALL repeat the site's `Content-Signal` preference, because a crawler reads only its matched group. The `*` group SHALL appear once. Search crawlers SHALL remain allowed on public pages.

#### Scenario: Named AI group
- **WHEN** `robots.txt` has a group for `GPTBot`
- **THEN** that group contains the same `Content-Signal` line as the `*` group

#### Scenario: Single wildcard group
- **WHEN** `robots.txt` is parsed
- **THEN** it contains exactly one `User-agent: *` group

### Requirement: Declared AI access policy
The site SHALL record its AI access policy (training blocked, search and user-triggered retrieval allowed) in one place, and `robots.txt` and any Cloudflare rules SHALL match it. Search and answer crawlers named as allowed SHALL receive HTTP 200 for public pages.

#### Scenario: Allowed search crawler
- **WHEN** PerplexityBot requests `/en/cv`
- **THEN** the response is 200, not a 403 from the edge

#### Scenario: Blocked training crawler
- **WHEN** GPTBot requests `/en/cv`
- **THEN** the request is disallowed by `robots.txt`

### Requirement: llms.txt
The site SHALL serve `/llms.txt` as `text/plain` with a short description of the owner and absolute links to the CV, projects index, posts index and agent endpoints. It SHALL list only URLs that return 200. The file is advisory and SHALL NOT be described as affecting Google Search.

#### Scenario: llms.txt content
- **WHEN** `/llms.txt` is requested
- **THEN** it returns 200 `text/plain` and every link in it returns 200

### Requirement: Agent discovery manifest
The site SHALL publish a machine-readable manifest at a well-known path that lists the MCP endpoint and the WebMCP search endpoint with their URLs and auth requirement, in addition to the existing `<meta>` and `<link>` hints.

#### Scenario: Manifest lists endpoints
- **WHEN** the manifest is requested
- **THEN** it returns 200 JSON naming `/api/mcp` and `/api/webmcp/search` as absolute URLs

### Requirement: MCP protected-resource metadata links resolve
The `resource_documentation` URL in the MCP protected-resource metadata SHALL resolve to a 200 page without redirecting.

#### Scenario: Documentation link
- **WHEN** a client fetches the `resource_documentation` URL
- **THEN** it receives 200

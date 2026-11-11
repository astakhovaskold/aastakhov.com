# webmcp-integration Specification

## Purpose

Enables in-browser Web Model Context Protocol (WebMCP) and declarative Site Tools, allowing browser-based AI assistants and ChatGPT Web to discover, query, and navigate website content directly in the user session.

## Requirements

### Requirement: Client-Side WebMCP Tool Registration
The website client application MUST register structured Site Tools into the browser model context API (`navigator.modelContext` or `window.modelContext` when available) to enable AI agents to query site content programmatically.

#### Scenario: Browser supporting WebMCP initializes on page load
- **WHEN** a user visits any page on the website with a browser environment exposing `navigator.modelContext`
- **THEN** the client registers site tools including `search_content`, `get_post_by_slug`, `get_cv_summary`, and `list_projects` with parameter schemas and descriptions

#### Scenario: Tool execution returns structured content
- **WHEN** a browser AI agent invokes `search_content` with a query string and optional locale parameter
- **THEN** the tool returns matching published items formatted as clean Markdown or JSON

### Requirement: Declarative HTML Site Tools Fallback
The website pages MUST include declarative tool annotations or metadata on search and navigation components so AI agents lacking imperative WebMCP APIs can discover available tool capabilities from the DOM.

#### Scenario: Agent inspects DOM for declarative site capabilities
- **WHEN** an AI agent inspects a page containing content search or navigation
- **THEN** the DOM elements expose recognizable `toolname`, `tooldescription`, or structured semantic metadata matching the WebMCP specification

### Requirement: Multi-Locale Content Resolution in Web Tools
All WebMCP site tools MUST accept an optional locale parameter (`ru` or `en`) defaulting to the current page's active locale, ensuring the returned content matches the language expected by the AI agent and user.

#### Scenario: Agent requests Russian content on English page
- **WHEN** an AI agent explicitly invokes a tool with `locale: "ru"` while viewing the English version of the site
- **THEN** the tool retrieves and returns the Russian localized version of the requested content

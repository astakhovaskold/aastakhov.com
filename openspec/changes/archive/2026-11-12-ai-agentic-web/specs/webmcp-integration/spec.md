# Spec Delta

## MODIFIED Requirements

### Requirement: Client-Side WebMCP Tool Registration
The website client application MUST register structured Site Tools into the browser model context API (`navigator.modelContext` or `window.modelContext` when available) to enable AI agents to query site content programmatically, including full Markdown retrieval for articles.

#### Scenario: Browser supporting WebMCP initializes on page load
- **WHEN** a user visits any page on the website with a browser environment exposing `navigator.modelContext`
- **THEN** the client registers site tools including `search_content`, `get_post_by_slug`, `get_post_markdown`, `get_cv_summary`, and `list_projects` with parameter schemas and descriptions

#### Scenario: Tool execution returns structured content
- **WHEN** a browser AI agent invokes `search_content` with a query string and optional locale parameter
- **THEN** the tool returns matching published items formatted as clean Markdown or JSON

#### Scenario: Agent retrieves full article Markdown via tool
- **WHEN** a browser AI agent invokes `get_post_markdown` with a post slug and locale
- **THEN** the tool returns the complete article formatted as Markdown ready for model consumption

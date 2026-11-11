# Design

## Context

Askold Astakhov's site positions the author as a Frontend Tech Lead and Web Architect specializing in agentic workflows and AI-ready web platforms. The codebase already includes an in-house Lexical-to-Markdown transformer (`src/lib/lexical-markdown.ts`) and browser WebMCP integration (`src/components/webmcp/WebMcpProvider.tsx`). See `proposal.md` for background.

## Goals / Non-Goals

**Goals:**
- Provide dynamic, cached `/llms.txt` and `/llms-full.txt` endpoints conforming to the LLM web standard.
- Serve raw markdown at `/<locale>/posts/<slug>.md` and `/<locale>/projects/<slug>.md` with frontmatter for curl, AI agents, and scrapers.
- Add an accessible "Copy for LLM" button to post and project detail headers.
- Extend `WebMcpProvider` with a `get_post_markdown` tool.

**Non-Goals:**
- Embedding vector search databases (relying on PostgreSQL ILIKE / semantic WebMCP search).
- Modifying database schemas or CMS field definitions.

## Decisions

### Decision 1: Structure of `/llms.txt` and `/llms-full.txt`
- **Choice**:
  - `/llms.txt` begins with H1 `# Askold Astakhov`, author background, core areas of engineering expertise, philosophy, followed by `## Core Articles` with title, date, URL, and a 1-sentence summary for each piece.
  - `/llms-full.txt` compiles all published articles in full, delimited by markdown dividers (`---`), with YAML frontmatter for each item.
- **Alternatives Considered**: Static markdown files checked into git.
- **Rationale**: Dynamic generation from Payload CMS guarantees that new articles and updates are immediately included in the LLM index without manual maintenance.

### Decision 2: YAML Frontmatter in Raw `.md` Routes
- **Choice**: Structure `/<locale>/posts/<slug>.md` with standard YAML frontmatter:
  ```markdown
  ---
  title: "Frontend Architecture for Data-Heavy Workflows"
  slug: "frontend-architecture-for-data-heavy-workflows"
  publishedAt: "2026-08-15T09:00:00.000Z"
  description: "..."
  canonicalUrl: "https://askoldastakhov.com/en/posts/..."
  ---

  # Frontend Architecture for Data-Heavy Workflows
  ...
  ```
- **Alternatives Considered**: Raw text without metadata.
- **Rationale**: Frontmatter provides explicit provenance and dates for LLM tokenizers and evaluation harnesses.

### Decision 3: Client Copy for LLM Button Implementation
- **Choice**: Implement `<CopyMarkdownButton title={...} description={...} markdown={...} />` using the standard `navigator.clipboard.writeText` API with an icon toggle (`Copy` $\rightarrow$ `Check` "Copied for LLM!").
- **Alternatives Considered**: Triggering a file download.
- **Rationale**: Direct clipboard copying is the primary workflow for users pasting context into Claude, ChatGPT, or Cursor chat windows.

## Risks / Trade-offs

- **[Risk] Serializing massive articles into `/llms-full.txt` causing memory spikes**  
  → *Mitigation*: Stream response chunks or cache at edge with `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`.
- **[Risk] Clipboard API permissions blocked in non-secure or iframe contexts**  
  → *Mitigation*: Gracefully handle clipboard errors with fallback prompt or tooltip.

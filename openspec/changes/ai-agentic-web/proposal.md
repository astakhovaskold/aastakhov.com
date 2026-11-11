# Proposal

## Why

As an engineering leader specializing in Web Architecture and Agentic Workflows, the author's personal platform should serve as a premier reference implementation of the Agentic Web. While the platform currently provides base MCP and WebMCP endpoints, modern AI web agents (such as Cursor, ChatGPT, Claude, Perplexity, and Browser-Use) rely on standard discovery files (`/llms.txt` and `/llms-full.txt`) and clean Markdown content feeds to accurately index, cite, and ingest technical longreads without scraping HTML or running into paywalls. Additionally, human technical readers frequently want to copy clean, unbloated Markdown into their own LLM prompts with a single click.

## What Changes

- **Standard `llms.txt` and `llms-full.txt` Endpoints**:
  - Implement `/llms.txt` providing a concise, curated index of author profile, core engineering philosophies, and categorized article links.
  - Implement `/llms-full.txt` compiling comprehensive Markdown representations of all published posts and case studies.
  - Support `/.well-known/llms.txt` redirect/alias for universal crawler compatibility.
- **Direct Markdown Article Feeds (`.md` routes)**:
  - Implement dynamic route handlers `/posts/[slug].md` and `/projects/[slug].md` serving raw, frontmattered Markdown for curl, HTTP clients, and AI agents.
- **Interactive "Copy for LLM" / "Markdown" UI Action**:
  - Add a dedicated "Copy for LLM" button with visual feedback to the post detail and project detail headers, placing clean Markdown on the user's clipboard.
- **Enhanced WebMCP Agent Capabilities**:
  - Expand `WebMcpProvider` with a `get_post_markdown` tool, enabling browser agents to retrieve full structured Markdown directly in-session.

## Capabilities

### New Capabilities
- `llms-standard`: Automated generation and edge caching of `/llms.txt` and `/llms-full.txt` files conforming to the LLM index standard.
- `article-markdown-distribution`: Raw Markdown HTTP routes (`/posts/[slug].md`) and an interactive "Copy for LLM" client button.

### Modified Capabilities
- `webmcp-integration`: Enhance client-side WebMCP tool registration to include full Markdown content retrieval for AI assistants.

## Impact

- Affected routes:
  - `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts` (new routes)
  - `src/app/.well-known/llms.txt/route.ts` (redirect/alias)
  - `src/app/(frontend)/[locale]/posts/[slug]/route.ts` or `.md` handler
- Affected components:
  - `src/components/site/post-detail-content.tsx` (Copy for LLM button)
  - `src/components/webmcp/WebMcpProvider.tsx` (new tool registration)
- Dependencies:
  - Reuses existing `src/lib/lexical-markdown.ts` serializer; zero new external libraries required.

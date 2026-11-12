# Design

## Context

The current Next.js 16 application executes dynamically on every request due to `export const dynamic = 'force-dynamic'`. This causes every visitor hit and bot crawl to invoke a serverless function and query Postgres (Neon). The project already has a mature search API (`/api/webmcp/search`) and Lexical rich-text markdown serialization (`src/lib/lexical-markdown.ts`). See `proposal.md` for background.

## Goals / Non-Goals

**Goals:**
- Replace indiscriminate `force-dynamic` with On-Demand ISR and tag-based edge caching.
- Add Payload CMS `afterChange` and `afterDelete` hooks to instantly invalidate modified pages and sitemaps.
- Implement an accessible, keyboard-navigable Command Palette (`Cmd+K`) leveraging the existing `/api/webmcp/search` endpoint.
- Implement dynamic `/llms.txt` and `/llms-full.txt` route handlers conforming to the standard for AI agent discoverability.

**Non-Goals:**
- Changing database schema or ORM.
- Introducing heavy UI component libraries (e.g., massive component kits).
- Caching OAuth, MCP session endpoints, or admin panel routes (which must remain strictly dynamic).

## Decisions

### Decision 1: Payload Revalidation Hooks for Targeted Invalidation
- **Choice**: Implement a reusable `revalidateContent` hook in Payload collections and globals that calls Next.js `revalidatePath` for specific routes (`/[locale]/posts`, `/[locale]/posts/[slug]`, `/[locale]/projects`, `/sitemap.xml`, `/rss.xml`).
- **Alternatives Considered**: Time-based polling or relying solely on short TTL cache.
- **Rationale**: Event-driven on-demand revalidation provides the best of both worlds: 100% edge-cached speed for users with immediate 0-second freshness upon editing in Payload.

### Decision 2: Reuse `/api/webmcp/search` for Command Palette
- **Choice**: Connect the client Command Palette modal to the existing `/api/webmcp/search` route with client-side debouncing (150ms).
- **Alternatives Considered**: Third-party search services (Algolia) or building a separate duplicated search index.
- **Rationale**: The WebMCP search endpoint already queries posts, categories, projects, and CV entries with PostgreSQL ILIKE / ranking, returning formatted JSON with URLs and excerpts. Reusing it eliminates code duplication.

### Decision 3: Native HTML Dialog and Keybinding for Command Palette
- **Choice**: Implement `<CommandPalette />` using the standard HTML `<dialog>` element with standard ARIA attributes (`role="combobox"`, `aria-expanded`, `aria-activedescendant`) and keyboard listeners for `Cmd+K`, `Ctrl+K`, and `/`.
- **Alternatives Considered**: Heavy external libraries (`cmdk`).
- **Rationale**: Keeps client bundle size minimal, ensures zero hydration mismatches, and works reliably across all mobile and desktop browsers.

### Decision 4: Markdown Generation for `/llms.txt` and `/llms-full.txt`
- **Choice**: Build route handlers that load published posts and site settings, using `lexical-markdown.ts` to transform Lexical ASTs into pristine Markdown with frontmatter.
- **Alternatives Considered**: Static files manually maintained in `/public`.
- **Rationale**: As new articles or case studies are published in Payload CMS, `/llms.txt` and `/llms-full.txt` automatically stay up to date without manual editing.

## Risks / Trade-offs

- **[Risk] Revalidation hooks firing during database migrations or bulk imports**  
  → *Mitigation*: Wrap revalidation calls in try/catch and check `process.env.PAYLOAD_MIGRATING !== 'true'`.
- **[Risk] Command Palette modal accessibility on screen readers**  
  → *Mitigation*: Use native focus trap, `aria-modal="true"`, and manage focus return to previous active element on close.
- **[Risk] Large payload size on `/llms-full.txt`**  
  → *Mitigation*: Cache the route at the edge (`Cache-Control: public, max-age=3600, stale-while-revalidate=86400`) and stream or paginate if content exceeds 2MB.

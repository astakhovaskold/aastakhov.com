# Proposal

## Why

Currently, the public application relies on `export const dynamic = 'force-dynamic'` across root layouts, meaning every visitor request triggers a full serverless invocation and multiple queries to PostgreSQL (Neon). This increases Time to First Byte (TTFB), raises compute costs, and leaves the site vulnerable to traffic spikes. Furthermore, visitors and recruiters have no fast way to discover content across articles, projects, and CV achievements without manual page navigation. Finally, while the platform supports MCP and WebMCP protocols for local AI tools, it lacks the public `/llms.txt` and `/llms-full.txt` standard files expected by modern web AI agents (Cursor, ChatGPT, Claude, Perplexity) to index and cite author expertise accurately.

## What Changes

- **On-Demand ISR & Edge Caching Architecture**:
  - Remove blanket `export const dynamic = 'force-dynamic'` from layout and content routes in favor of Next.js Incremental Static Regeneration (ISR) and tag-based caching.
  - Implement Payload CMS lifecycle hooks (`afterChange`, `afterDelete`) in `posts`, `projects`, and globals (`site-settings`, `cv`) calling `revalidatePath` and `revalidateTag`.
  - Deliver public content pages from Vercel Edge Cache with sub-50ms TTFB while guaranteeing instant content freshness on CMS updates.
- **Global Command Palette & Search (`Cmd+K`)**:
  - Implement an accessible, keyboard-first modal dialog (`Cmd+K` / `Ctrl+K`) for fast client-side and server-backed search.
  - Search across articles, projects, open-source work, and CV competencies.
  - Include keyboard shortcuts, visual categorization badges, and direct navigation links.
- **AI Agent Standards (`/llms.txt` & `/llms-full.txt`)**:
  - Implement dynamic route handlers for `/llms.txt` and `/llms-full.txt` per the emerging LLM web standard.
  - Provide concise, structured markdown summarizing the author's technical profile, architecture philosophies, key case studies, and index of published longreads.

## Capabilities

### New Capabilities
- `caching-and-revalidation`: On-demand edge caching and granular revalidation hooks connecting Payload CMS mutations with Next.js ISR.
- `site-search`: Global command palette interface with instant keyboard navigation across content collections and CV skills.
- `agent-readiness`: Public standard `/llms.txt` and `/llms-full.txt` endpoints providing structured author knowledge and article index for AI models.

### Modified Capabilities
<!-- None: existing MCP and WebMCP specs remain untouched. -->

## Impact

- Affected routes:
  - `src/app/(frontend)/[locale]/layout.tsx` (caching strategy, command palette integration)
  - `src/app/(frontend)/[locale]/posts/page.tsx`, `src/app/(frontend)/[locale]/posts/[slug]/page.tsx`, etc. (ISR segment configs)
  - `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts` (new routes)
- Affected CMS collections & globals:
  - `src/collections/Posts.ts`, `src/collections/Projects.ts`, `src/globals/SiteSettings.ts`, `src/globals/CV.ts` (revalidation hooks)
- Dependencies:
  - Lightweight command palette primitives (e.g. `cmdk` or native dialog with zero dependencies).

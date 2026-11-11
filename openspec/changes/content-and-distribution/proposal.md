# Proposal

## Why

The site serves as the canonical thought leadership and lead generation platform for Askold Astakhov (Frontend Tech Lead & Web Architect). While articles are in-depth (1,000–3,000 words with architecture diagrams and technical breakdowns), technical decision-makers (CTOs, Heads of Engineering, Founders) struggle to quickly navigate longreads without an interactive Table of Contents. Additionally, the site lacks an automated syndication feed (RSS/Atom) to capture engineering audiences using feed readers (Feedly, Inoreader) and enable automated cross-posting to external channels (Substack, Dev.to, Telegram). Finally, post detail pages lack high-intent contextual callouts (CTAs) to convert high-value readers into architectural consultations and client engagements.

## What Changes

- **Automated RSS/Atom Syndication Feed**:
  - Implement `/feed.xml` and `/rss.xml` generating valid RSS 2.0 / Atom XML feeds for published posts.
  - Support locale-specific feeds (`/ru/feed.xml`, `/en/feed.xml`).
  - Add autodiscovery `<link rel="alternate" type="application/rss+xml" ...>` tags in the root layout `<head>`.
- **Interactive Table of Contents (TOC) for Longreads**:
  - Automatically extract `h2` and `h3` heading anchors from Lexical rich-text content in posts.
  - Render a sticky, collapsible TOC on post detail pages with active scrollspy highlighting the current section as the user reads.
  - Add anchor copy links on headings for quick sharing of specific sections.
- **Contextual B2B Consultation Callout (CTA)**:
  - Add a dedicated editorial CTA component at the bottom of posts (before pagination and footer), targeted at CTOs, engineering leads, and technical founders with direct links to booking/Telegram/email.
- **Related Content Recommendations**:
  - Add a contextual recommendations section at the end of post pages showing related posts from the same taxonomy category or linked project case studies.

## Capabilities

### New Capabilities
- `content-syndication`: Automated generation of RSS 2.0 / Atom syndication feeds with locale support and layout autodiscovery headers.
- `editorial-ux`: Reading enhancements for longform technical articles, including automated heading extraction for a sticky Table of Contents with scrollspy, heading anchors, and contextual B2B conversion callouts.

### Modified Capabilities
<!-- None: existing MCP and WebMCP specs remain untouched. -->

## Impact

- Affected routes:
  - `src/app/feed.xml/route.ts` and `src/app/rss.xml/route.ts` (new routes)
  - `src/app/(frontend)/[locale]/layout.tsx` (autodiscovery link tags)
  - `src/app/(frontend)/[locale]/posts/[slug]/page.tsx` (TOC, CTA, and related content integration)
- Affected components and libraries:
  - `src/components/site/post-detail-content.tsx` (TOC and CTA components)
  - `src/lib/lexical-headings.ts` (heading extraction utility)
  - `src/lib/rss.ts` (feed generator utility)
- Dependencies:
  - No heavy external libraries required; native XML generation or lightweight feed builder.

# Design

## Context

The site runs on Next.js 16 (App Router) with Payload CMS 3.x and Postgres. Post content is authored using Lexical RichText and rendered on the client/server using `ContentRenderer`. Posts are localized into Russian (`ru`) and English (`en`), with canonical and Open Graph metadata already configured. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide standard RSS 2.0 XML feeds at `/feed.xml`, `/rss.xml`, and localized variants (`/ru/feed.xml`, `/en/feed.xml`).
- Add autodiscovery `<link>` tags in the root layout head for RSS.
- Extract `h2` and `h3` heading anchors from Lexical rich-text on the server.
- Render a sticky, collapsible Table of Contents with active scrollspy using native browser `IntersectionObserver`.
- Render clickable/copyable anchor icons on headings.
- Add a conversion-focused B2B Consultation Callout (CTA) at the bottom of post detail pages.
- Add a contextual Related Writing section rendering up to 3 related posts based on post category.

**Non-Goals:**
- Full-text article content in RSS feeds (RSS will serve titles, summaries, publication dates, and canonical links to preserve canonical traffic).
- Building an internal email marketing/newsletter delivery engine (CTA links directly to Cal.com/Booking, Telegram, and email).
- Modifying the Payload CMS database schema (headings and related posts are derived dynamically from existing post fields).

## Decisions

### Decision 1: Lightweight Native XML Builder for RSS
- **Choice**: Implement a dedicated TypeScript helper `generateRssFeed({ posts, locale, siteUrl })` returning raw RSS 2.0 XML using template literals and XML entity escaping.
- **Alternatives Considered**: Using third-party npm packages (`feed`, `rss`).
- **Rationale**: A self-contained generator is under 60 lines of code, adds zero npm dependencies, avoids supply chain risk, and executes instantaneously in Next.js Route Handlers.

### Decision 2: Server-Side Lexical Heading Extraction
- **Choice**: Create `extractHeadingsFromLexical(content)` utility that traverses the Lexical AST `root.children` looking for `type: 'heading'` with `tag: 'h2' | 'h3'`. Each heading receives a sanitized kebab-case `id`.
- **Alternatives Considered**: Client-side DOM parsing (`document.querySelectorAll('h2, h3')`).
- **Rationale**: Server-side extraction allows rendering the Table of Contents in the initial SSR HTML payload with zero layout shift (CLS), providing immediate structure to both users and crawlers.

### Decision 3: Native IntersectionObserver Scrollspy
- **Choice**: Implement a client component `<TableOfContents headings={headings} />` using `IntersectionObserver` with `rootMargin: '-80px 0% -60% 0%'` to track the currently visible section.
- **Alternatives Considered**: Window `scroll` event listeners.
- **Rationale**: `IntersectionObserver` offloads work to the browser compositor thread, ensuring 60fps scrolling performance without throttling or debounce overhead.

### Decision 4: Editorial B2B Callout Component
- **Choice**: Add `<PostConsultationCta locale={locale} settings={settings} />` directly inside `PostDetailPage`.
- **Alternatives Considered**: Hardcoding links in every Lexical post body.
- **Rationale**: Centralized component maintains consistent brand tone (per `POSTS.md`), automatically pulls contact links from `SiteSettings`, and can be updated globally across all existing and future articles.

## Risks / Trade-offs

- **[Risk] Duplicate heading texts within the same article generating identical anchor IDs**  
  → *Mitigation*: The heading extraction function maintains a frequency map of generated slugs and appends an incremental counter (e.g. `architecture`, `architecture-1`) for duplicates.
- **[Risk] Short articles (under 300 words or fewer than 2 headings) showing a redundant TOC**  
  → *Mitigation*: The TOC component automatically hides itself if fewer than 2 headings are present in the article.
- **[Risk] RSS feed cache staleness**  
  → *Mitigation*: Configure Route Handlers with `export const dynamic = 'force-dynamic'` and `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`.

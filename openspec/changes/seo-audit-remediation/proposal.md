# Proposal

## Why

The 2026-11-11 SEO audit scored aastakhov.com 54/100. The site has almost nothing indexable, its sitemap lists a 404 and omits `/en` URLs, canonical and hreflang point at redirecting URLs, metadata and schema are generic, and basic security headers are missing. Fixing these now lets search and AI engines index and attribute the site to its owner before more content is published. All findings, with IDs, are in `audit-findings.md` in this change.

## What Changes

- Make the sitemap, canonical, hreflang and `x-default` agree on one URL form (`/ru`, `/en`, no trailing slash) and list each locale as its own `<loc>` with a reciprocal alternate set (F-03, F-04, F-22, F-31).
- Generate the sitemap only from documents that pass the same publication check as the detail routes, and add real `lastmod` dates (F-02, F-21, F-37).
- `noindex` empty listing and category pages until they have items, and drop them from the sitemap. Remove the canonical from 404 metadata (F-12, F-13).
- Replace the generic home metadata with localized, descriptive titles and descriptions, and add a `%s — <name>` title template for section pages (F-05, F-20).
- Replace the site-wide Person and WebSite JSON-LD with one linked `@graph` using stable `@id`s. Add `BlogPosting` for posts, fix the breadcrumb shape, add `Blog`/`CollectionPage` schema, and stop exposing the email (F-10, F-11, F-14, F-35, F-36, F-27).
- Add security headers, hide `x-powered-by`, make the home page cacheable, prioritise the hero image, and set an image cache TTL (F-08, F-16, F-17, F-33).
- Add a services section and a primary CTA to the home page, put Projects in the nav, fix the orphaned project page and mobile contact placement, and localize the English eyebrow on `/ru` (F-07, F-18, F-25, F-28, F-29, F-30).
- Repeat `Content-Signal` per AI-bot group in `robots.txt`, fix the MCP `resource_documentation` link, and add `llms.txt` and a discovery file (F-19, F-23, F-24, F-32).
- Add a topic model (`Posts.topic`, `Posts.relatedPosts`), topic hub pages and "More in this topic", so the content clusters from the audit can be published (F-26). Publishing the content itself (F-01) and the facts in F-06 need owner input and are tracked as tasks, not decided here.
- **BREAKING** (URL form): home canonical and hreflang URLs lose the trailing slash. External links and Search Console properties pointing at `/ru/` keep working via the existing 308.

## Capabilities

### New Capabilities
- `seo-indexing-and-sitemap`: which URLs are advertised to crawlers (sitemap, canonical, hreflang, `x-default`, noindex rules, not-found metadata) and how they stay consistent with page availability.
- `seo-metadata-and-structured-data`: localized page titles and descriptions, and the JSON-LD entity graph (Person, WebSite, ProfilePage, BlogPosting, CreativeWork, BreadcrumbList, collection pages).
- `site-security-and-performance`: HTTP security headers, cache behaviour of public pages, hero image priority and image cache TTL.
- `agent-discovery`: crawler and agent-facing files (`robots.txt` content signals, `llms.txt`, discovery manifest) and their link targets.
- `homepage-and-navigation`: home page offer and CTA, primary navigation, mobile contact placement, locale-correct microcopy.
- `blog-topic-taxonomy`: topic relation for posts, topic hub pages, and same-topic related links.

### Modified Capabilities

None. The existing `mcp-server` and `webmcp-integration` specs describe protocol behaviour that does not change. The `resource_documentation` link fix is covered by `agent-discovery`.

## Impact

- Code: `src/app/sitemap.ts`, `src/lib/sitemap.ts`, `src/lib/seo.ts`, `src/lib/structured-data.ts`, `src/lib/projects.ts`, `src/app/robots.ts`, `next.config.ts`, `src/middleware.ts`, `src/app/(frontend)/[locale]/layout.tsx` and the `page.tsx` files under it, `src/components/site/*`, `src/collections/Posts.ts` and a new topic collection, Payload migrations and `payload-types.ts`.
- Data: Payload site settings (SEO defaults, `github`, role/location fields), project and post records (publication state), production seed state.
- Infra, outside the repo (owner action): Cloudflare AI Crawl Control for PerplexityBot, a single-hop apex redirect, Google/Moz/Bing credentials for re-measurement.
- Dependencies: none new expected. Verify `ld-generator` still fits the graph shape; replace it with plain objects if not.
- Out of scope: writing the posts and case studies themselves, backlink building, video, and the deferred AI-integrations cluster.

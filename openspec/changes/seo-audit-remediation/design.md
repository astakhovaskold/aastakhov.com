# Design

## Context

See `proposal.md` for motivation and `audit-findings.md` for the finding IDs (F-xx) cited below. The app is Next.js (App Router, `next-intl` with `localePrefix: 'always'`, default locale `ru`) over Payload CMS. `AGENTS.md` warns this Next.js version differs from training data: read the relevant guide in `node_modules/next/dist/docs/` before changing caching, headers, metadata or route handlers.

Facts observed in code (read-only):

- `createSeoMetadata` (`src/lib/seo.ts`) builds `/${locale}${canonicalPath}`. The locale layout passes `canonicalPath: '/'`, which yields `/ru/` (F-04). The layout's metadata also supplies canonical and alternates to every child that does not override `alternates`. `createNotFoundMetadata` sets no `alternates`, so a 404 inherits the home canonical (F-13).
- `src/app/sitemap.ts` hardcodes `/ru${entry.path}` and builds alternates for `en` unconditionally; `getPublicSitemapEntries` loads only `ru` data with `fallbackLocale: 'ru'`; it is `force-dynamic` (F-03, F-22, F-37).
- Sitemap filters projects with `isProjectPublic`; the detail route also requires `isPubliclyIndexableEntity`. They disagree when `_status` is `published` and `publishedAt` is null or in the future (F-02, F-18).
- `[locale]/layout.tsx` is `force-dynamic`. Data helpers return `[]` when `NEXT_PHASE === 'phase-production-build'`, so any page that becomes statically prerendered would bake empty content (F-16).
- `next-intl` middleware adds its own `Link` alternate header with `x-default` pointing at `/`, which 307s (F-04).
- `robots.txt` is a Cloudflare-managed block plus `src/app/robots.ts`. `MetadataRoute.Robots` cannot express `Content-Signal` (F-19).
- `src/middleware.ts` matcher excludes paths containing a dot, so `/llms.txt` and `/.well-known/*` skip the i18n middleware.

## Goals / Non-Goals

**Goals:**
- Every URL the site advertises is final, 200, and correct for its locale.
- Machine-readable identity (JSON-LD) is one connected graph fed from site settings.
- Public pages are cacheable without serving stale or empty content after a CMS edit.
- The code changes need no content decisions; the content decisions are isolated in Payload data and listed as owner tasks.

**Non-Goals:**
- Writing posts, case studies or services copy. This change builds the places they go.
- Deciding the owner's location, role or employment framing (F-06).
- Cloudflare, DNS and Vercel domain changes. They are listed as owner actions with acceptance checks.
- Changing MCP/OAuth protocol behaviour.

## Decisions

**D1. One URL helper.** Add `pageUrl(locale, path)` in `src/lib/seo.ts`: joins `/${locale}` and `path`, treats `/` as empty, never leaves a trailing slash, returns an absolute URL. `createSeoMetadata`, the sitemap, JSON-LD and OG all call it. Alternative: set `trailingSlash: true` so `/ru/` returns 200. Rejected: it changes every inner URL, which all currently return 200 without a slash.

**D2. Canonical lives in pages, not the layout.** Remove canonical, alternates and `og:url` from the locale layout's `generateMetadata`; keep icons, `metadataBase`, `other` meta and a title template there. The home `page.tsx` emits its own via `createSeoMetadata`. `createNotFoundMetadata` returns only `title` and `robots: noindex`, so a 404 inherits no canonical. Alternative: override with `alternates: { canonical: null }`. Rejected: relies on merge semantics that differ by version; removing the source is simpler.

**D3. `x-default` is `/ru`, emitted once.** Set the next-intl routing option that disables automatic alternate `Link` headers, so metadata is the only source and the HTML and header cannot disagree (F-04, F-31). `/ru` is the default locale and returns 200 directly. Switching to `/en` later is a one-line change.

**D4. One publication rule.** Export `isProjectPubliclyVisible(project)` from `src/lib/projects.ts` combining `isProjectPublic` and `isPubliclyIndexableEntity`. The list, detail, sitemap and MCP/WebMCP helpers call it. First, diagnose the production `automatica` record to confirm the hypothesis in `audit-findings.md`; if the cause is different (for example a missing `en` document), fix that instead and keep the shared rule. Alternative: loosen `isPubliclyIndexableEntity`. Rejected: it also guards posts, and a future-dated `publishedAt` must stay hidden.

**D5. Sitemap per locale from real localization.** For each of `ru` and `en`, fetch with `fallbackLocale: false`; a slug is listed in a locale only if that locale's document exists, and alternates include only locales where it exists plus `x-default` pointing at `ru` when `ru` exists. `lastmod` comes from `updatedAt`/`lastModified` of the record; static pages omit it. Wrap the entry builder in `unstable_cache`/tag-based cache (confirm the current API in the docs) revalidated by CMS hooks, replacing `force-dynamic` (F-37). Pages served through `fallbackLocale` (an `en` URL showing `ru` text) stay reachable but unlisted; see Open Questions.

**D6. Empty listings noindex by count.** `generateMetadata` of posts index, projects index and category pages calls the same data helper as the page and passes `noindex: true` when it returns zero items. The sitemap builder omits those paths on the same condition. No flag or config to flip later.

**D7. Metadata copy lives in Payload.** Localized `seo.defaultTitle`/`defaultDescription` in site settings are data. Replace the generic values via the seed and a data migration, and replace the hardcoded English fallbacks in `createSeoMetadata` with locale-aware strings from `next-intl` messages. The title template `%s — <name>` is a Next.js `title.template` in the layout. Alternative: hardcode copy in code. Rejected: the owner edits copy in the CMS.

**D8. Entity graph from site settings.** Add `createSiteGraph(settings, locale)` returning `{ '@context', '@graph': [Person, WebSite] }` with the `@id`s from the spec. Extend the site-settings global with `jobTitle`, `alternateName`, `description`, `image`, `knowsAbout`, `homeLocation`, `devto` (and ensure `github`). Role, location and availability are single fields reused by the home page, the CV header and the Person (spec: consistent facts). Page schemas reference `{ '@id': '.../#person' }`. Build plain typed objects and drop `ld-generator` where it produces the malformed `BreadcrumbList` and thin `Person`; keep it only if another use remains (check imports first). `createArticleSchema` becomes `BlogPosting`. The email is removed from JSON-LD.

**D9. Security headers via `next.config.ts`.** Add a `headers()` entry for all non-admin, non-API paths with `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'self'`, HSTS (`max-age=63072000`, no `includeSubDomains` yet), and a static CSP. Set `poweredByHeader: false`. The CSP is static (`script-src 'self' 'unsafe-inline'` plus the Umami origin), not nonce-based: nonces force dynamic rendering, which conflicts with D10. Ship the CSP as `Content-Security-Policy-Report-Only` first, then enforce after a clean week. `/admin`, `/api` and `/oauth` are excluded from the CSP; the existing MCP CORS entries stay untouched.

**D10. Cacheable public pages with on-demand revalidation.** Remove `force-dynamic` from the locale layout and public pages; set `revalidate` as a safety net and call `revalidatePath`/tag invalidation from Payload `afterChange`/`afterDelete` hooks for posts, projects, categories, topics and site settings. To stop the build guards baking empty pages, public pages must not prerender at build: either keep them dynamic-on-first-request (no `generateStaticParams` for content routes) or remove the build-phase guard and require DB access at build. Decide with a spike (task 5.1) that measures the response `Cache-Control` and `x-vercel-cache`. Fallback if ISR proves unworkable: keep dynamic rendering and send `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600` for HTML via headers, if the framework allows overriding it. Cloudflare then needs a cache rule for HTML (owner action).

**D11. Hero image.** Add `priority` (eager, `fetchPriority="high"`) to the home portrait and set `images.minimumCacheTTL` to one year in `next.config.ts` (content-hashed or versioned URLs; the media API URLs change when a file is replaced).

**D12. `robots.txt` as a route handler.** Replace `src/app/robots.ts` with `src/app/robots.txt/route.ts` that writes every group explicitly, repeats `Content-Signal` in each named AI-crawler group, and has one `User-agent: *` group. Because Cloudflare currently prepends a managed block, the owner turns that injection off so the app is the only source; until then the output can contain duplicates (see Risks). The AI policy (training blocked; search and user-triggered allowed) is a constant list in one module that both `robots.txt` and the tests read.

**D13. `llms.txt` and manifest as route handlers.** `src/app/llms.txt/route.ts` generates text from site settings and published pages with the same publication rule as D4. `src/app/.well-known/ai-catalog.json/route.ts` lists the MCP and WebMCP endpoints as absolute URLs. Both are cached and revalidated like D10. `resource_documentation` in `src/lib/mcp-oauth.ts` points at `/llms.txt` until a dedicated docs page exists.

**D14. Topics as a Payload collection.** New `topics` collection (localized `title`, `description`; `slug`; optional `pillar` relation to posts). `Posts` gains `topic` (single relation) and `relatedPosts` (hasMany, filtered to published, same locale). Free-text `tags` stay for now. New route `/[locale]/topics/[slug]` renders the hub; the post page's "More" block uses the order in the spec. Requires a Payload migration and regenerated types. Format categories remain as a secondary facet.

**D15. Home and navigation.** Navigation entries are computed from counts (`getPublishedProjects(locale, { limit: 1 })`, posts, categories) so an empty section never shows. Site settings already hold `services`, `location`, `availability`, `homeEyebrow` and `bookingUrl`; render `services` on the home page (it is not shown today) and add a localized `proof` list field for the proof points, so copy stays editable in the CMS. The primary CTA is one `Button` link to the configured contact URL; contact block moves above the portrait on mobile. The eyebrow text becomes a localized site-settings field. Replace `<br/>` word joins with a space plus a CSS break.

## Risks / Trade-offs

- [Stricter publication rule hides a project that is visible today] → Compare list/detail/sitemap output before and after against production data; the rule only aligns the three, it does not add exclusions.
- [Caching serves stale or empty content] → On-demand revalidation from CMS hooks, short `revalidate` safety net, no build-time prerender of content pages, and a task that edits a post and polls the public URL.
- [CSP breaks admin, analytics or inline JSON-LD] → Report-Only first, admin/API excluded, console check on `/ru`, `/admin`, a post and a project before enforcing.
- [Duplicate or conflicting `robots.txt` while Cloudflare injection is still on] → Acceptance check fetches the live file and counts `User-agent: *` groups; owner action is a prerequisite for that scenario.
- [Canonical URL change shifts index signals] → The old `/ru/` still 308s to `/ru`; resubmit the sitemap in Search Console and watch coverage.
- [`unsafe-inline` weakens the CSP] → Accepted trade-off to keep pages cacheable; revisit with hashes if the inline script set is small and stable.
- [Topic migration on production data] → Additive fields only (nullable relations); no existing field is removed or renamed.
- [Edge/`PerplexityBot` findings used a spoofed user agent] → Treat F-09 as "verify in dashboard", not as a confirmed block.

## Migration Plan

Ship in this order, each step independently deployable and revertable with `git revert`:

1. Diagnose production data (published state, seed, `automatica`). No code.
2. URL helper, canonical move, shared publication rule, sitemap rewrite, noindex-when-empty, 404 metadata (spec `seo-indexing-and-sitemap`). Then resubmit the sitemap.
3. Metadata copy, title template, entity graph, `BlogPosting`, breadcrumbs (spec `seo-metadata-and-structured-data`).
4. Home page, navigation, microcopy (spec `homepage-and-navigation`), after the owner confirms the facts.
5. Security headers (Report-Only), image settings, caching spike and rollout (spec `site-security-and-performance`).
6. `robots.txt`, `llms.txt`, manifest (spec `agent-discovery`), then owner turns off Cloudflare's managed robots injection and allows PerplexityBot.
7. Topics collection, migration, hub pages (spec `blog-topic-taxonomy`), then publish content.

Rollback: revert the step's commit; Payload migrations in step 7 are additive and have a `down` that drops the new collection and fields. After each step run `pnpm lint`, `pnpm test:int`, and the live checks listed in `tasks.md`.

## Open Questions

- Should an `en` URL that renders `ru` text through `fallbackLocale` be `noindex` with a canonical to the `ru` page? It does not change the specs or tasks now; decide when real `en` content gaps appear.
- Should `x-default` move to `/en` for an international audience (F-31)? One-line change in D3; no spec impact.
- What dedicated page should `resource_documentation` eventually point to? `/llms.txt` satisfies the spec.
- Keep or retire free-text `tags` once topics exist? Does not affect this change.

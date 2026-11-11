# SEO audit findings (source data for this change)

Audit run: 2026-11-11, `/seo audit https://aastakhov.com` (11 parallel agents). Site: Next.js + Payload, locales `ru` (default) and `en`, canonical host `www.aastakhov.com`.

SEO Health Score: **54/100**. Technical 68, Content 35, On-page 42, Schema 52, Performance 88 (lab only, home page), AI search 41, Images 82. SXO gap 31/100. E-E-A-T 43. Backlinks: no score (Common Crawl only, no Moz/Bing keys). Lighthouse Agentic Browsing: no score (PSI 429). Agent-UX heuristic: 100.

Each finding has an ID that `design.md` and `tasks.md` cite. Severity is the audit's. "Owner" means the fix needs a decision or access that code cannot supply.

## Root-cause hypothesis

Live `/ru|en/posts`, `/ru|en/projects` and all four category pages are empty, although `src/seed-content.ts` has 5 posts. Production is probably unseeded or unpublished. `/ru/projects/automatica` is in the sitemap but returns 404.

Code lead (read-only check): the sitemap filters with `isProjectPublic` (`src/lib/projects.ts`) and the detail route additionally requires `isPubliclyIndexableEntity` (`src/lib/seo.ts`). The two disagree when `_status` is `published` but `publishedAt` is null or in the future. `isProjectPublic` ignores `publishedAt` once `_status` is set, while `isPubliclyIndexableEntity` rejects it. This is a hypothesis; verify against the production record before changing code.

## Critical

- **F-01 No indexable content.** Posts, projects, categories empty in both locales; home has about 46 words. Failure check: `/ru/posts` still shows the empty message after publishing. (content, sxo, geo, cluster)
- **F-02 Sitemap lists a 404.** `/ru/projects/automatica` and its `/en` alternate return 404. See root-cause hypothesis. (sitemap, content, sxo, geo)
- **F-03 Sitemap has no `/en` `<loc>` entries.** All 10 `<loc>` are `/ru/...`; `/en` appears only as `xhtml:link` alternates, and alternates lack `x-default`. `src/app/sitemap.ts` hardcodes `/ru${entry.path}`. (sitemap, technical, sxo, content)

## High

- **F-04 Canonical, hreflang, sitemap, `og:url` use redirecting URLs.** Home canonical is `https://www.aastakhov.com/ru/`, which 308s to `/ru` (same for `/en/`). Cause: `createSeoMetadata` builds `/${locale}${canonicalPath}` with `canonicalPath: '/'` in the locale layout. Also `x-default` differs: HTML `/ru/`, HTTP `Link` header `/` (307). Person `url` is `https://www.aastakhov.com/` (redirects). (technical, sitemap, content, geo)
- **F-05 Generic home metadata.** `<title>Askold Astakhov</title>`; description `Personal site for Askold Astakhov.` is English on `/ru`; OG/Twitter repeat it. Source: `settings.seo.defaultTitle/defaultDescription` and hardcoded fallbacks in `createSeoMetadata`. Suggested RU title: `Аскольд Астахов — Frontend-архитектор и технический лидер`; EN: `Askold Astakhov — Frontend Architect & Tech Lead (React, Next.js)`. Description 140-160 chars per locale. (technical, content, sxo, geo)
- **F-06 Contradicting facts across pages/locales.** Owner decision. Location: Madrid (home), Санкт-Петербург · Удалённо (RU CV), Remote (EN CV). Team size: "до 20" (RU) vs "6-8" (EN). Titles differ per locale (Element: Frontend Engineer vs Senior Frontend Engineer; Webit: Fullstack vs Web Engineer). Positioning: home "independent, available" vs CVs showing employment at Philosophy.IT since Aug 2024. Role names differ: home "Независимый IT-эксперт", RU CV "Frontend Architect & Tech Lead", EN CV "Frontend Tech Lead & Lead Frontend Engineer". RU CV lacks the metrics the EN CV has (-60% setup time, PR merge 1.5 to 0.4 days, -78% contract-mismatch rejections, 2.8s to 300ms table render). (content, sxo)
- **F-07 No offer or primary CTA.** Home is a 46-word hero plus skill tags; service SERPs show scope, price, proof, CTA. Mobile 375x812: no contact CTA above the fold (contacts below portrait). Desktop: contacts are four small underlined links. (sxo, visual)
- **F-08 Security headers missing.** Only `strict-transport-security: max-age=63072000`. Missing: `includeSubDomains`/`preload`, CSP, `X-Content-Type-Options`, frame protection, `Referrer-Policy`, `Permissions-Policy`. `x-powered-by: Next.js, Payload` leaks stack. `next.config.ts` `headers()` only sets CORS for `/api/mcp`. `umami.aastakhov.com` exists; check before `includeSubDomains`. (technical)
- **F-09 PerplexityBot 403 at Cloudflare edge** despite robots allow. Spoofed-UA test; verify in dashboard. Owner (Cloudflare access). (geo)
- **F-10 Schema thin and unlinked.** `createPersonSchema` has name, `mailto:` email, sameAs, url only; no `@id`, `jobTitle`, `image`, `description`, `knowsAbout`, `worksFor`, `homeLocation`, `alternateName`. `createWebsiteSchema` url is `/ru` or `/en`, no `@id`, `publisher`, `inLanguage` array. `createProfilePageSchema` mainEntity is a separate Person named by title. Project pages use `CreativeWork` without `@id`/author link. Article schema author is an inline Person. GitHub exists (`astakhovaskold`) but is missing from site and sameAs when `settings.github` is empty. Plaintext email in JSON-LD defeats Cloudflare obfuscation. (schema, content, sxo, geo, technical)
- **F-11 No `BlogPosting`/dated content.** Uses `Article`; no visible dates; renderer reports a static `publication_date`. Posts unverifiable live because none are indexed. (schema, geo, content)
- **F-12 Empty listings are indexable.** `/posts`, `/projects`, four category pages return 200, `robots: index`, and are in the sitemap. (content, sxo)
- **F-13 404 pages canonicalise to the homepage** and carry the generic title/description; the 404 document has no `lang`. `createNotFoundMetadata` goes through `createSeoMetadata`, which sets a canonical. (sxo, content)

## Medium

- **F-14 `/cv` BreadcrumbList malformed.** `createBreadcrumbSchema` nests `item` as `{@id,name}` inside `ListItem` and repeats `@context`; both crumbs named "Askold Astakhov". Should be `name` on ListItem, `item` a URL string, 2nd crumb "CV". (schema)
- **F-15 Redirect chain.** `http://aastakhov.com` -> 308 `https://aastakhov.com` -> 308 `https://www.aastakhov.com/` -> 307 `/ru` -> 200. Unknown paths 307 to `/ru/...` then 404. Owner (domain/Cloudflare/Vercel config). (technical, performance, content)
- **F-16 Home not cacheable; slow TTFB.** `cache-control: private, no-cache, no-store`, `x-vercel-cache: MISS`; curl TTFB 1.9-2.5 s, Lighthouse root document 1,150-1,240 ms. `[locale]/layout.tsx` has `export const dynamic = 'force-dynamic'`; sitemap is also `force-dynamic`. (performance, technical)
- **F-17 Hero avatar lazy-loaded above the fold**; optimized image URL `cache-control: public, max-age=0, must-revalidate` (needs `images.minimumCacheTTL`). (performance, technical)
- **F-18 Projects missing from nav; orphan project page.** Nav is Блог/Резюме only. `/ru/projects/personal-website` returns 200 but the projects index says none; page has stray text `TEXT Copy контент -> контекст -> решения -> поставка`. Guides category in sitemap but not in "Темы". Index/detail disagreement suggests the same publish-filter mismatch as F-02. (content, sxo, geo, visual)
- **F-19 `Content-Signal` only in `User-agent: *`.** Named AI-bot groups have only `Disallow: /`; repeat the line per group (RFC 9309 matched-group rule). Two `User-agent: *` groups exist. `robots.txt` is Cloudflare-managed plus `src/app/robots.ts`. (agentic, content)
- **F-20 Section titles lack the name.** Titles like "Блог", "Проекты", "Статьи", "Руководства", "Blog", "Личный сайт". Use a `%s — Аскольд Астахов` template. (content)
- **F-21 No `lastmod` in sitemap**, except posts via `getPostLastModifiedDate`. Use real change dates. (sitemap, technical)
- **F-22 hreflang alternates assume both locales exist** for each slug. `/en/projects/automatica` is 404. Build alternates only for locales where the document exists. (sitemap)
- **F-23 `/api/mcp` auth metadata** `resource_documentation` points to `/docs/payload-mcp`, which 307s. (agentic)
- **F-24 Custom meta names (`model-context`, `webmcp-endpoint`) have no confirmed consumer.** Add `/.well-known/mcp/server-card.json` or `ai-catalog.json` (both drafts). No `navigator.modelContext.registerTool` call sites. (agentic)
- **F-25 Mobile layout.** Portrait after tags pushes contacts down; desktop layout differs. (visual)
- **F-26 CMS cannot express topic clusters.** Tags are free text, localized differently; no `relatedPosts`/pillar relation; "More" block shows recent posts; taxonomy is by format (Articles/Case notes/Notes); Guides/Essays defined in seed but empty. (cluster)
- **F-27 Entity signals.** GitHub and dev.to not linked from site/sameAs; name search ("Askold Astakhov", "Аскольд Астахов") does not return the site (WebSearch, US region, Yandex unchecked). (sxo, geo)

## Low

- **F-28** Touch targets about 20 px tall (not measured). (visual)
- **F-29** English eyebrow "MADRID · AVAILABLE FOR SELECTED PROJECTS" on `/ru`. (visual, sxo, content)
- **F-30** H1 text extracts as "АскольдАстахов" / "IndependentIT expert" because `<br/>` replaces a space. (content)
- **F-31** `x-default` points to `/ru`; consider `/en`. Owner decision. (content, geo)
- **F-32** No `llms.txt`, `llms-full.txt`, `ai-catalog.json`, RSS/Atom feed, `security.txt`; `/favicon.ico` 404 (icons are declared via `<link>`). (technical, agentic, geo)
- **F-33** Unused JS about 50 KiB, legacy polyfills about 12 KiB, bfcache blocked (likely `no-store`), analytics script preloaded. (performance)
- **F-34** Mermaid/diagram and multimedia thin; no video. (geo)
- **F-35** Email in JSON-LD has `mailto:` prefix. (schema)
- **F-36** No `CollectionPage`/`Blog` schema on `/posts`, `/projects`. (schema)
- **F-37** `getPublicSitemapEntries` runs on every request (`force-dynamic`). (sitemap)

## Needs owner action outside the repo

- Cloudflare AI Crawl Control: allow PerplexityBot, keep training bots blocked (F-09).
- Single-hop apex redirect rule at Cloudflare/Vercel (F-15).
- Google API key for PageSpeed Insights (rerun Lighthouse and Agentic Browsing score, get CrUX field INP).
- Moz and Bing Webmaster keys; verify the site in Bing Webmaster Tools and Google Search Console (backlinks, index coverage).
- Decide the facts in F-06, the `x-default` locale (F-31), the services/pricing copy (F-07), and which seed content to publish (F-01).

## Not verified by the audit

Field Core Web Vitals and INP; Search Console index coverage; Yandex; touch-target sizes and CLS from a real browser; inner-page performance and images; OG/Twitter image sizes; production record values behind F-02.

## Content plan from the cluster audit (input to the topic-cluster requirement)

- Cluster A, frontend architecture at scale: pillar "Frontend architecture that survives product growth"; spokes on Domain-Driven Frontend, DDF vs Feature-Sliced Design vs Clean Architecture, micro-frontends when not to, the data-heavy-workflows case.
- Cluster B, technical audit and quality/performance: pillar "Frontend technical audit: what it covers and what you get"; spokes: audit checklist, slow tables 2.8s to 300ms, CRA to Vite 4min to 10s, signs you need an audit.
- Cluster C, delivery without heroism: pillar `delivery-without-heroism`; spokes: release process for an enterprise frontend team, CI/CD quality gates with Playwright + MSW, rescuing a delayed project.
- Deferred cluster D: AI integrations (LLM APIs, MCP, WebMCP), after A-C have 3+ posts each.
- Cannibalization to avoid: `frontend-that-does-not-collapse` vs `frontend-architecture-for-data-heavy-workflows`; `delivery-without-heroism` vs `release-process-for-enterprise-frontend-team`; audit pillar vs `technical-audit-checklist`.

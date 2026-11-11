# Tasks

Finding IDs (F-xx) are in `audit-findings.md`. Decision IDs (D-x) are in `design.md`. Before changing caching, headers, metadata or route handlers, read the matching guide in `node_modules/next/dist/docs/` (see `AGENTS.md`). Run `pnpm lint` and `pnpm test:int` at the end of every group.

## 1. Diagnose production state (no code)

- [ ] 1.1 Query the production `projects` record for slug `automatica` (all locales, with `fallbackLocale: false`) and record `_status`, `published`, `publishedAt`, and whether `en` fields exist. Verify by writing the values and the confirmed or rejected D4 hypothesis into `audit-findings.md` under Root-cause hypothesis.
- [ ] 1.2 Count published posts, projects and categories in production per locale, and compare with `src/seed-content.ts`. Verify by adding the counts to `audit-findings.md` and stating whether production is unseeded or unpublished.
- [ ] 1.3 Find why `/ru/projects` shows no projects while `/ru/projects/personal-website` returns 200 (compare `projects/page.tsx` filtering with `getProjectDetailBySlug`). Verify by naming the differing condition in `audit-findings.md` (F-18).
- [ ] 1.4 Confirm every subdomain of `aastakhov.com` serves HTTPS (at least `umami`, `www`). Verify by recording the result; it gates HSTS `includeSubDomains` in 5.2.

## 2. Indexing and sitemap (spec `seo-indexing-and-sitemap`)

- [x] 2.1 Add `pageUrl(locale, path)` to `src/lib/seo.ts` (no trailing slash; `/` becomes the bare locale) and route `createSeoMetadata`, `absoluteSiteUrl` callers for page URLs, and `src/lib/structured-data.ts` through it. Verify with a new int test: `pageUrl('ru','/')` is `.../ru`, `pageUrl('en','/projects')` is `.../en/projects`.
- [x] 2.2 Move canonical, alternates and `og:url` out of `src/app/(frontend)/[locale]/layout.tsx` `generateMetadata` into the home `page.tsx`; keep icons, `metadataBase`, `other` meta in the layout. Verify with `curl -s https://localhost:3000/ru` (dev server) that the home canonical is `/ru` and there is exactly one canonical tag.
- [x] 2.3 Change `createNotFoundMetadata` to return only `title` and `robots: noindex`. Verify with an int test that its result has no `alternates` and, with `curl -s -i /ru/projects/nope`, that status is 404, `noindex` is present, and there is no canonical to the home page.
- [x] 2.4 Disable next-intl's automatic alternate `Link` header in `src/i18n/routing.ts` (check the option name in the installed `next-intl` docs). Verify with `curl -sI /ru` that no `Link` header with a different `x-default` is present, and the HTML `x-default` is `/ru`.
- [x] 2.5 Export `isProjectPubliclyVisible` from `src/lib/projects.ts` (combines `isProjectPublic` and `isPubliclyIndexableEntity`) and use it in the projects index, `getProjectDetailBySlug`, the detail page, the sitemap builder and the MCP/WebMCP project lookups. Verify with int tests for: `_status: 'published'` with null `publishedAt`, future `publishedAt`, `published: false`, legacy record with no fields.
- [x] 2.6 Rewrite `src/lib/sitemap.ts` and `src/app/sitemap.ts`: one entry per locale, per-locale existence (`fallbackLocale: false`), reciprocal alternates plus `x-default`, real `lastmod` for posts, projects and categories, empty lists omitted. Replace `force-dynamic` with a tagged cache revalidated by the CMS hooks from 4.3 (use a 300 s revalidate until those land). Update `tests/int/sitemap.int.spec.ts`. Verify with int tests for: both locales listed, one-locale slug lists one URL and no `en` alternate, empty posts index absent, `lastmod` present for a post and absent for `/cv`.
- [x] 2.7 Add count-based `noindex` to the posts index, projects index and category page `generateMetadata`. Verify with int tests (zero items gives `noindex`, one item gives `index`) and with the page rendering in dev with an empty database.
- [x] 2.8 Add a script `scripts/check-sitemap.ts` (or a test helper) that fetches `/sitemap.xml` and requests every `<loc>`, failing on non-200 or any redirect. Verify by running it against the dev server and getting zero failures; document the command in `docs/seo-checks.md`.
- [x] 2.9 Check the 404 document has `<html lang>` and a not-found title (F-13): trigger `notFound()` on `/ru/projects/nope` and an unmatched path; fix `not-found` handling if `lang` is missing. Verify with `curl -s` on both and reading the `<html>` tag.

## 3. Metadata and structured data (spec `seo-metadata-and-structured-data`)

- [x] 3.1 Replace hardcoded English fallbacks in `createSeoMetadata` with locale-aware strings from `next-intl` messages, and add the `%s — <name>` title template in the layout. Verify with int tests: Russian fallback title/description contain no "Personal site", and a list page title ends with the site name.
- [x] 3.2 Add a Payload data migration (new file in `src/migrations/`, registered in `src/migrations/index.ts`) setting localized `seo.defaultTitle` and `seo.defaultDescription` for `ru` and `en`, and update the matching entries in `src/seed-content.ts`. Owner supplies final copy; the proposed strings from `audit-findings.md` F-05 are the default. Verify by running the migration on a local database and reading the values through `getSiteSettings('ru')` and `('en')`.
- [x] 3.3 Extend `src/globals/SiteSettings.ts` and `PublicSiteSettings` with `jobTitle`, `alternateName`, `description`, `image`, `knowsAbout`, `homeLocation`, `devto`; add a migration and run `pnpm generate:types`. Verify `pnpm tsc --noEmit` passes and the admin shows the new fields.
- [ ] 3.4 Implement `createSiteGraph(settings, locale)` in `src/lib/structured-data.ts` per D8 and use it in the layout instead of the two separate blocks; omit unset fields; drop the email. Verify with int tests: one Person with `@id`, `WebSite` `inLanguage` is `["ru","en"]`, `publisher` references the Person, no `image` when unset, no `mailto:` anywhere.
- [ ] 3.5 Make `createProfilePageSchema`, `createCreativeWorkSchema` and the new `createBlogPostingSchema` (replacing `createArticleSchema`) reference the Person by `@id`; include `dateModified` and an image when present. Verify with int tests for the `/cv` ProfilePage `mainEntity` and a post with `lastModified`.
- [ ] 3.6 Fix `createBreadcrumbSchema` (string `item`, no nested `@context`, descriptive crumb names including "CV"). Check whether `ld-generator` has any remaining use after 3.4-3.6 and remove it from `package.json` if not. Verify with an updated `tests/int/structured-data.int.spec.ts` and `pnpm build` passing.
- [ ] 3.7 Add visible published and modified dates to the post detail page and `Blog`/`CollectionPage` + `ItemList` schema to the posts and projects indexes. Verify with a component test that the date renders and an int test that the `ItemList` matches the items.
- [ ] 3.8 Validate the output of `/ru`, `/en/cv` and a post with a structured-data validator (Rich Results Test or schema.org validator). Verify by recording zero errors in `docs/seo-checks.md`.

## 4. Home page and navigation (spec `homepage-and-navigation`)

- [ ] 4.1 Owner decisions, recorded in `docs/seo-checks.md`: canonical role title, location, availability, employment framing and team size (F-06), final services and proof copy (F-07). Verify the file lists each value and who approved it. Tasks 4.2-4.7 do not start until this exists.
- [ ] 4.2 Reconcile the CV content (`src/globals/CV.ts` data, `docs/cv-content-2026-draft.md`, seed) so both locales agree on role, location, team size and job titles, and carry the same metrics. Add a migration for existing production CV data. Verify with an int test that compares the two locales' key facts and with a manual read of `/ru/cv` and `/en/cv`.
- [ ] 4.3 Add Payload `afterChange`/`afterDelete` hooks for posts, projects, categories, topics, CV and site settings that call `revalidatePath`/`revalidateTag` for the affected public pages and the sitemap. Verify with a test that publishing a post invalidates the posts index and the sitemap tag.
- [ ] 4.4 Render `settings.services` on the home page and add a localized `proof` list field (migration + types + seed); target at least 250 visible words. Verify with a component test of the home page and a word count of the rendered text in dev.
- [ ] 4.5 Add one primary contact button (uses `bookingUrl` or the Telegram link) and keep other contacts as secondary links; on mobile place the contact block above the portrait; give nav and contact links a 44 px hit area. Verify with a Playwright test at 375x812 (button inside the first 812 px) and at 1920x1080 (exactly one primary action), and a bounding-box check of the nav links.
- [ ] 4.6 Compute navigation from public counts and add Projects; hide empty categories in the topics list; list every public project on the projects index and remove the stray `TEXT Copy ...` text from the personal-website project content. Verify with int tests for nav with and without projects and a test that `/ru/projects` links to every project whose detail returns 200.
- [ ] 4.7 Make the home eyebrow a localized setting (data migration for the English "Madrid · Available ..." string) and replace the `<br/>` word joins in the hero. Verify that `/ru` has no English eyebrow and the extracted H1 text contains spaces.

## 5. Security headers, caching and images (spec `site-security-and-performance`)

- [ ] 5.1 Spike the cacheable-page approach (D10): make the home page ISR/static with on-demand revalidation without prerendering empty content, and measure `Cache-Control`, `x-vercel-cache` and TTFB on a preview deployment. Verify by recording headers and timings for two consecutive requests in `docs/seo-checks.md`, and by editing a post and seeing the change within the configured time.
- [ ] 5.2 Apply the chosen caching approach to the locale layout and public pages; remove `force-dynamic` where it was only for data freshness. Verify that `pnpm build` passes, the built pages contain real content (not empty states) after the first request, and the live check in 5.1 repeats on production.
- [ ] 5.3 Add the security headers and `poweredByHeader: false` in `next.config.ts` (D9), with the CSP in Report-Only mode and `/admin`, `/api`, `/oauth` excluded from the CSP. Verify with `curl -sI /ru` showing every header from the spec and no `X-Powered-By`, and with a console check of `/ru`, a post, a project and `/admin` showing no violations.
- [ ] 5.4 After one week of clean reports, switch the CSP to enforcing and, if 1.4 passed, add `includeSubDomains` to HSTS. Verify the headers on production and that analytics events still reach Umami.
- [ ] 5.5 Add `priority` to the home portrait and `images.minimumCacheTTL` in `next.config.ts`. Verify that the home HTML has no `loading="lazy"` on the portrait and has `fetchpriority="high"`, and the optimised image response has `max-age` of at least 86400.
- [ ] 5.6 Defer the Umami script (`afterInteractive` is already set; confirm the preload is gone) and trim legacy polyfills via `browserslist` if the bundle shrinks. Verify with a Lighthouse run showing unused JS reduced or no regression in LCP/TBT.

## 6. Agent and crawler files (spec `agent-discovery`)

- [ ] 6.1 Create the AI access policy module and `src/app/robots.txt/route.ts` replacing `src/app/robots.ts`; repeat `Content-Signal` in every named group, one `User-agent: *` group, sitemap line on the canonical host. Verify with an int test that parses the output and with `curl -s /robots.txt` on the dev server.
- [ ] 6.2 Add `src/app/llms.txt/route.ts` with owner summary and links to the CV, projects, posts and agent endpoints, from the same publication rule. Verify with an int test that every link in the output is a 200 route and `curl -sI /llms.txt` shows `text/plain`.
- [ ] 6.3 Add `/.well-known/ai-catalog.json` listing the MCP and WebMCP endpoints as absolute URLs. Verify with `curl -s` that the JSON parses and both URLs respond (the MCP endpoint answers `tools/list` as before).
- [ ] 6.4 Point `resource_documentation` in `src/app/.well-known/oauth-protected-resource/route.ts` at a 200 page (`/llms.txt`). Verify with `curl -sI` on the returned URL and that `tests/int` for the MCP routes still pass.

## 7. Topic taxonomy (spec `blog-topic-taxonomy`)

- [ ] 7.1 Add the `topics` collection (localized title and description, slug, optional pillar) and `Posts.topic` and `Posts.relatedPosts`; register in `payload.config.ts`; add the migration with a working `down`; run `pnpm generate:types`. Verify by running the migration up and down on a local database and creating a topic and a post in the admin.
- [ ] 7.2 Add `/[locale]/topics/[slug]` (pillar first, 404 when no public posts, `CollectionPage` schema, metadata) and include non-empty topics in the sitemap. Verify with int tests for hub with posts (200, pillar first), empty topic (404, not in sitemap).
- [ ] 7.3 Replace the post page "More" block with same-topic ordering and pillar/spoke links (spec order: related, same topic, latest; exclude current). Verify with component tests for ordering and for the spoke-to-pillar link.
- [ ] 7.4 Link topic hubs from the home page. Verify with a test that `/ru` links to each non-empty hub and to none that is empty.
- [ ] 7.5 Add the MCP/WebMCP read tools' topic fields only if the existing tools expose posts (check `src/app/api/webmcp` and the Payload MCP plugin config). Verify that existing MCP and WebMCP int tests still pass and a post query returns its topic.

## 8. Content and owner actions (tracked, not coded here)

- [ ] 8.1 Publish the five seed posts in production (or fix the unseeded state found in 1.2) and add an `en` translation for each. Verify with `scripts/check-sitemap.ts` showing the post URLs for both locales with 200.
- [ ] 8.2 Publish the cluster A and B pillar posts from the content plan in `audit-findings.md`, assigned to topics, each with a visible date and the cannibalization split noted there. Verify that each topic hub returns 200 and links to its pillar.
- [ ] 8.3 Cloudflare: allow PerplexityBot in AI Crawl Control, turn off the managed `robots.txt` injection once 6.1 is live, and add a single-hop apex-to-`www` redirect. Verify with `curl -sI -A "PerplexityBot" /ru/cv` returning 200, `curl -s /robots.txt` showing one `User-agent: *` group, and `curl -sIL http://aastakhov.com/` showing one redirect before `/ru`.
- [ ] 8.4 Add a Google API key, then re-run PageSpeed Insights and the Lighthouse Agentic Browsing audit; verify in Search Console and Bing Webmaster Tools, submit the sitemap, and add IndexNow. Verify by recording field CWV (including INP) and index coverage in `docs/seo-checks.md`.
- [ ] 8.5 Re-run `/seo audit https://aastakhov.com` after groups 2-7 are deployed. Verify the new health score is higher than 54 and no Critical findings remain.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied and the group 8 checks pass.
- Verify the archived specs under `openspec/specs/`.

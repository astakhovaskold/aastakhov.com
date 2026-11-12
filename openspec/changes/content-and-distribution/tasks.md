# Tasks

## 1. RSS Feed Syndication

- [x] 1.1 Implement `src/lib/rss.ts` feed builder helper with XML entity escaping and verify unit tests in `tests/int/rss.int.spec.ts` pass
- [x] 1.2 Implement route handlers for `/feed.xml`, `/rss.xml`, and localized variants `/[locale]/feed.xml` returning valid RSS 2.0 XML with appropriate caching headers
- [x] 1.3 Add RSS autodiscovery `<link rel="alternate" type="application/rss+xml">` tags in `src/app/(frontend)/[locale]/layout.tsx` and verify in rendered metadata

## 2. Table of Contents & Heading Anchors

- [x] 2.1 Implement `extractHeadingsFromLexical` in `src/lib/lexical-headings.ts` and verify unit tests in `tests/int/lexical-headings.int.spec.ts` cover extraction, slugification, and duplicate handling
- [x] 2.2 Update `src/components/site/content-renderer.tsx` heading blocks to assign matching anchor `id`s and render copyable permalink anchors
- [x] 2.3 Implement `<TableOfContents />` client component in `src/components/site/table-of-contents.tsx` using `IntersectionObserver` for active scrollspy

## 3. Conversion CTA & Related Content

- [ ] 3.1 Implement `<PostConsultationCta />` in `src/components/site/post-consultation-cta.tsx` offering direct booking, Telegram, and email links configured in Site Settings
- [ ] 3.2 Implement `getRelatedPosts(post, locale)` helper in `src/lib/posts-index.ts` returning up to 3 related articles from the same category or project references
- [ ] 3.3 Integrate `<TableOfContents />`, `<PostConsultationCta />`, and related content cards into `src/app/(frontend)/[locale]/posts/[slug]/page.tsx`

## 4. Integration Verification

- [ ] 4.1 Run full integration test suite (`pnpm run test:int`) and verify all test suites pass
- [ ] 4.2 Run production build (`pnpm run build`) and verify route generation and TypeScript types succeed

# Tasks

## 1. Edge Caching & On-Demand ISR

- [x] 1.1 Implement revalidation helpers in `src/lib/revalidation.ts` wrapping Next.js `revalidatePath` and `revalidateTag` with migration safeguards (done as `src/lib/revalidate.ts`, see seo-audit-remediation 4.3)
- [x] 1.2 Wire `afterChange` and `afterDelete` hooks in `src/collections/Posts.ts`, `src/collections/Projects.ts`, `src/globals/SiteSettings.ts`, and `src/globals/CV.ts` (done in seo-audit-remediation 4.3)
- [x] 1.3 Update route segment configs in `src/app/(frontend)/[locale]/layout.tsx`, `src/app/(frontend)/[locale]/posts/page.tsx`, and detail pages from blanket `force-dynamic` to ISR with on-demand invalidation (done: layout `revalidate = 300` plus empty `generateStaticParams` on the layout and slug pages, no build prerender; local `next start` shows MISS then HIT with real content on `/ru`; live check on preview/production stays in seo-audit-remediation 5.1/5.2)

## 2. Command Palette Search (Cmd+K)

- [x] 2.1 Implement accessible `<CommandPalette />` modal in `src/components/site/command-palette.tsx` with hotkey listener (`Cmd+K`, `Ctrl+K`, `/`), focus trap, and ARIA combobox pattern (dropped by owner: search not wanted; palette removed, nav shows \"Обсудить проект\" instead)
- [x] 2.2 Connect search input to `/api/webmcp/search` with debounce, result category groupings (Articles, Projects, Skills), and keyboard navigation (dropped by owner: search not wanted; palette removed, nav shows \"Обсудить проект\" instead)
- [x] 2.3 Add search trigger button with hotkey indicator into navigation header in `src/app/(frontend)/[locale]/layout.tsx` (dropped by owner: search not wanted; palette removed, nav shows \"Обсудить проект\" instead)

## 3. AI Agent Standards (llms.txt & llms-full.txt)

- [x] 3.1 Implement route handler `src/app/llms.txt/route.ts` generating curated Markdown index of author expertise, core philosophies, and articles (done in ai-agentic-web)
- [x] 3.2 Implement route handler `src/app/llms-full.txt/route.ts` compiling complete Markdown documents of all published articles using `lexical-markdown.ts` (done in ai-agentic-web)
- [x] 3.3 Add automated integration tests in `tests/int/llms.int.spec.ts` verifying markdown structure and HTTP caching headers (done in ai-agentic-web)

## 4. Integration Verification

- [x] 4.1 Run full integration test suite (`pnpm run test:int`) and verify all test suites pass
- [x] 4.2 Run production build (`pnpm run build`) and verify route generation and TypeScript types succeed

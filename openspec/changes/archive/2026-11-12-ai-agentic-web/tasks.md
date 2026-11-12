# Tasks

## 1. llms.txt & llms-full.txt Standard Endpoints

- [x] 1.1 Implement `generateLlmsTxt` and `generateLlmsFullTxt` builders in `src/lib/llms.ts` leveraging `src/lib/lexical-markdown.ts`
- [x] 1.2 Implement route handlers `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts` returning valid Markdown with edge caching headers
- [x] 1.3 Implement redirect route `src/app/.well-known/llms.txt/route.ts` and add `<link rel="alternate" type="text/markdown" href="/llms.txt">` in `src/app/(frontend)/[locale]/layout.tsx`

## 2. Raw Markdown Endpoints & Copy for LLM Button

- [x] 2.1 Implement raw markdown route handler `src/app/api/raw-markdown/route.ts` and rewrite/route for `/[locale]/posts/[slug].md` serving frontmattered Markdown
- [x] 2.2 Implement `<CopyMarkdownButton />` client component in `src/components/site/copy-markdown-button.tsx` with clipboard interaction and visual state feedback
- [x] 2.3 Integrate `<CopyMarkdownButton />` into `PostDetailHeader` in `src/components/site/post-detail-content.tsx` and project detail headers

## 3. WebMCP Agent Capabilities

- [x] 3.1 Register `get_post_markdown` tool in `src/components/webmcp/WebMcpProvider.tsx` accepting post slug and locale
- [x] 3.2 Add declarative DOM annotations for article markdown availability in `src/app/(frontend)/[locale]/posts/[slug]/page.tsx`

## 4. Integration Verification

- [x] 4.1 Add automated integration tests in `tests/int/llms.int.spec.ts` covering `/llms.txt`, `/llms-full.txt`, and markdown export structure
- [x] 4.2 Run full integration test suite (`pnpm run test:int`) and verify all tests pass
- [x] 4.3 Run production build (`pnpm run build`) and verify all routes and types compile cleanly

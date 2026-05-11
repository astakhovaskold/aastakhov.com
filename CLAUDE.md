# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # start dev server (http://localhost:3000)
yarn build      # production build
yarn start      # serve production build
yarn lint       # ESLint via next lint
```

Package manager is **Yarn** (Berry with node-modules linker). Do not use npm.

There are no tests in this project.

## Architecture

This is a Next.js 14 personal portfolio site for Askold Astakhov, built on the [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) template from Once UI. It uses the App Router with full i18n support via `next-intl`.

### Content system

All visible content flows through a single function: `renderContent(t)` in `src/app/resources/renderContent.js`. When the `i18n` flag in `src/app/resources/config.js` is `true` (current default), it returns `createI18nContent(t)` from `content-i18n.js`, where every string is looked up via `t('key')`. When `i18n` is `false`, it falls back to the static `content.js`.

Translations live in `messages/{en,de,es,ru}.json`. These are the source of truth for all UI text when i18n is enabled.

Blog posts and work projects are **locale-scoped MDX files**:
- `src/app/[locale]/blog/posts/{locale}/*.mdx`
- `src/app/[locale]/work/projects/{locale}/*.mdx`

MDX frontmatter fields: `title`, `publishedAt` (YYYY-MM-DD), `summary`, `image` (single), `images` (array), `tag`, `team`.

`src/app/utils/utils.ts` reads MDX files from disk at build time using `gray-matter`; `getPosts(['src','app','[locale]','blog','posts',locale])` is the standard call pattern.

### Configuration

`src/app/resources/config.js` controls:
- `routes` — enable/disable entire page sections (`/`, `/about`, `/work`, `/blog`, `/gallery`)
- `protectedRoutes` — map of paths requiring password (auth via cookie from `/api/authenticate`)
- `style` — Once UI theming tokens applied as `data-*` attributes on `<html>`
- `effects` — background visual effects (mask, gradient, dots, lines)

### Once UI design system

The entire Once UI component library is **vendored locally** under `src/once-ui/`. Do not install it as an npm package. Components are imported from `@/once-ui/components`. Theming is controlled entirely via CSS custom properties defined in `src/once-ui/tokens/` and applied through data attributes (`data-theme`, `data-brand`, `data-accent`, `data-neutral`, etc.) set in the root layout.

Layout primitives are `<Flex>` and `<Grid>` — these are the primary building blocks for all UI. Use `fillWidth`, `direction`, `gap`, `paddingX/Y`, `alignItems`, `justifyContent` props rather than raw CSS where possible.

### Routing and i18n

`src/i18n/routing.ts` defines the supported locales (`en`, `de`, `es`, `ru`) with `en` as default. The default locale is shown without a prefix (`/about` instead of `/en/about`). All navigation must use the `Link`, `redirect`, `usePathname`, and `useRouter` wrappers exported from `src/i18n/routing.ts`, not the raw Next.js equivalents.

`src/middleware.ts` handles locale detection and redirection for all non-API, non-static routes.

### Adding content

**New blog post**: create `src/app/[locale]/blog/posts/{locale}/your-slug.mdx` for each locale. The slug is derived from the filename.

**New work project**: create `src/app/[locale]/work/projects/{locale}/your-slug.mdx` for each locale.

**New translation key**: add to all four `messages/*.json` files and reference via `t('key')` in `content-i18n.js`.

**Enable/disable a page section**: toggle the boolean in the `routes` object in `config.js`.

### Analytics

Vercel Analytics and Speed Insights are injected in `src/app/[locale]/layout.tsx`. Yandex Metrica is in `src/app/analytics/YandexMetrica.tsx` (ID `103735154`).

### Environment variables

See `.env.example`:
- `NEXT_PUBLIC_BASE_URL` — hostname without protocol (used for OG image URLs and metadata)
- `NEXT_PUBLIC_AUTH_PASSWORD` — password for protected routes
- `NEXT_PUBLIC_YANDEX_METRIKA_ID` — Yandex Metrica counter ID

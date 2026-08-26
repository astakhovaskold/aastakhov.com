````md
# AI Tasks Index — Personal Site v2

Этот файл — главный чеклист для Codex. Работай сверху вниз. После завершения каждой задачи меняй чекбокс `- [ ]` на `- [x]`, добавляй короткую строку в **Implementation log** и переходи к следующей задаче.

## Source of truth

1. Главный функциональный дизайн: `README.md`.
2. Карта HTML-референсов: `MOCKUPS_MAP.md`.
3. Детальные задачи: папки `01-*` ... `22-*`, файл `task.md` внутри каждой.
4. HTML-макеты в `mockups/` использовать как визуальный референс, а не как готовый production-код.

## Product direction

Сайт — личный сайт Askold Astakhov как builder / technical partner. Это не сайт агентства и не фриланс-витрина.

Основная структура:

```txt
/
/projects
/projects/:slug
/posts
/posts/category/:slug
/posts/:slug
/cv
````

Не добавлять без отдельной задачи:

```txt
/work
/works
/services
/services/:slug
/cases
/cases/:slug
/open-source
/open-source/:slug
```

## Design constraints

Соблюдать zero design:

* высокий контраст;
* text-first;
* минимум декоративного UI;
* без Tailwind и UI-kit, если это не согласовано отдельно;
* без лишних chips/pills;
* без rounded cards как основного паттерна;
* без декоративных dividers;
* без слабой серой иерархии текста;
* без агентского portfolio-style на личном сайте.

Актуальный базовый визуальный референс:

```txt
02-base-layout-zero-design/mockups/askold-home-contrast-v7.html
08-home-page/mockups/askold-home-contrast-v7.html
```

## Working protocol for Codex

Для каждой задачи:

1. Открой `task.md` в соответствующей папке.
2. Посмотри `mockups/README.md`, если папка содержит `mockups/`.
3. Реализуй задачу минимально достаточным способом.
4. Не меняй публичную архитектуру маршрутов без необходимости.
5. Не добавляй новые библиотеки, если можно обойтись штатными средствами.
6. Запусти доступные проверки: typecheck, lint, build, tests, если они есть.
7. Обнови чекбокс в этом файле.
8. Добавь запись в **Implementation log**.

Формат записи:

```txt
- YYYY-MM-DD — Completed 08-home-page: кратко что сделано, какие проверки запускались.
```

Если задача заблокирована:

```txt
- YYYY-MM-DD — Blocked 08-home-page: причина, что нужно уточнить.
```

---

# Phase 1 — Project foundation

* [x] **01 — Init blank Payload project**
  Path: `01-init-blank-payload/task.md`
  Goal: поднять чистый Payload + Next.js проект на blank template.

* [x] **02 — Base layout and zero design**
  Path: `02-base-layout-zero-design/task.md`
  Mockups: `02-base-layout-zero-design/mockups/`
  Goal: общий layout, header, footer, CSS-переменные, базовая типографика.

* [x] **03 — Payload SiteSettings global**
  Path: `03-payload-site-settings/task.md`
  Goal: глобальные контакты, ссылки, availability, SEO defaults.

---

# Phase 2 — Payload content model

* [x] **04 — Payload Projects collection**
  Path: `04-payload-projects/task.md`
  Goal: коллекция для `/projects` и `/projects/:slug`.

* [x] **05 — Payload Posts collection**
  Path: `05-payload-posts/task.md`
  Goal: статьи, notes, guides, essays, case notes через `category`.

* [x] **06 — Payload OpenSource collection**
  Path: `06-payload-open-source/task.md`
  Goal: open-source элементы для главной без отдельного публичного раздела.

* [x] **07 — Payload CV global**
  Path: `07-payload-cv/task.md`
  Goal: данные онлайн-CV и ссылка на PDF.

---

# Phase 3 — Public pages

* [ ] **08 — Home page `/`**
  Path: `08-home-page/task.md`
  Mockups: `08-home-page/mockups/`
  Goal: Hero, Selected projects, Selected case notes, Open Source, From the blog, Contacts.

* [x] **09 — Projects index `/projects`**
  Path: `09-projects-index/task.md`
  Mockups: `09-projects-index/mockups/`
  Goal: список проектов, не клиентское портфолио.

* [x] **10 — Project detail `/projects/:slug`**
  Path: `10-project-detail/task.md`
  Mockups: `10-project-detail/mockups/`
  Goal: универсальная detail-страница проекта, включая Automatica.

* [x] **11 — Posts index `/posts`**
  Path: `11-posts-index/task.md`
  Mockups: `11-posts-index/mockups/`
  Goal: общий индекс материалов с category links.

* [x] **12 — Post category page `/posts/category/:slug`**
  Path: `12-post-category-page/task.md`
  Mockups: `12-post-category-page/mockups/`
  Goal: страницы категорий, особенно `/posts/category/cases` для case notes.

* [x] **13 — Post detail `/posts/:slug`**
  Path: `13-post-detail/task.md`
  Mockups: `13-post-detail/mockups/`
  Goal: универсальный zero-design renderer для article/case/note/guide/essay.

* [x] **14 — CV page `/cv`**
  Path: `14-cv-page/task.md`
  Goal: онлайн-резюме из Payload Global `CV`.

---

# Phase 4 — Shared implementation

* [ ] **15 — Shared components**
  Path: `15-shared-components/task.md`
  Goal: ProjectList, PostList, OpenSourceList, ContactLinks и переиспользуемые item-компоненты.

* [ ] **16 — Content renderer**
  Path: `16-content-renderer/task.md`
  Mockups: `16-content-renderer/mockups/`
  Goal: единый renderer rich content для `/projects/:slug` и `/posts/:slug`.

---

# Phase 5 — SEO, indexing, analytics

* [ ] **17 — SEO metadata**
  Path: `17-seo-metadata/task.md`
  Goal: metadata для всех публичных страниц, fallbacks, Open Graph.

* [ ] **18 — Sitemap and robots**
  Path: `18-sitemap-robots/task.md`
  Goal: sitemap без unpublished контента, robots.txt, production URL из env.

* [ ] **19 — Analytics adapter**
  Path: `19-analytics-adapter/task.md`
  Goal: no-op analytics adapter и события для кликов/просмотров.

---

# Phase 6 — Data, responsive, cleanup

* [ ] **20 — Seed content**
  Path: `20-seed-content/task.md`
  Goal: demo data для проверки всех страниц.

* [ ] **21 — Responsive check**
  Path: `21-responsive-check/task.md`
  Goal: проверить mobile/tablet/desktop, особенно hero, списки и изображения.

* [ ] **22 — UI cleanup**
  Path: `22-ui-cleanup/task.md`
  Mockups: `22-ui-cleanup/mockups/`
  Goal: финальная чистка против лишнего UI, карточности и слабой иерархии.

---

# Global acceptance checklist

* [ ] Проект запускается локально.
* [ ] Payload admin доступен.
* [ ] Все коллекции и globals созданы.
* [ ] `/` работает без ошибок при пустых и заполненных данных.
* [x] `/projects` работает.
* [x] `/projects/:slug` отдаёт страницу или 404.
* [x] `/posts` работает.
* [x] `/posts/category/:slug` работает и отдаёт 404 для неизвестной категории.
* [x] `/posts/:slug` отдаёт страницу или 404.
* [x] `/cv` работает и скрывает пустые блоки.
* [ ] Open Source выводится только как блок, без отдельного route.
* [ ] Services не являются отдельным route.
* [ ] Cases не являются отдельным route, только `Posts.category = case`.
* [ ] Header/footer используют `SiteSettings`.
* [ ] Данные не ломают layout при отсутствии картинок.
* [ ] TypeScript без критических ошибок.
* [ ] Build проходит.
* [ ] Lint проходит или задокументированы причины.
* [ ] Sitemap/robots работают.
* [ ] Metadata настроена.
* [ ] Analytics adapter не ломает сайт без env.
* [ ] Mobile layout читаемый.
* [ ] Визуальный стиль соответствует zero design.

---

# Implementation log

- 2026-08-25 — Completed 01-init-blank-payload: verified blank Payload + Next.js App Router setup, removed starter frontend content, aligned env example with Postgres, fixed pnpm/ESLint/build/test scripts; checks: generate:types, lint, build, test:int.
- 2026-08-25 — Completed 02-base-layout-zero-design: added shared public site container, header, footer, high-contrast zero-design typography, link styles, spacing, and responsive rules; checks: generate:types, lint, build.
- 2026-08-25 — Completed 03-payload-site-settings: added Payload SiteSettings global, public fallback helper, runtime header/footer settings usage, home contacts from settings, and SEO defaults; checks: generate:types, lint, build, test:int, local API smoke.
- 2026-08-25 — Completed 04-payload-projects: added Projects collection with slug generation, project metadata, images, featured/order controls, rich content, temporary related post slugs, and SEO fields; reset clean DB public schema and verified Payload API; checks: generate:types, lint, build, test:int, local API smoke.
- 2026-08-25 — Completed 05-payload-posts: added Posts collection for articles, notes, guides, essays, and case notes with category/language enums, publish metadata, home flags, related projects, media, tags, rich content, and SEO fields; checks: generate:types, lint, build, test:int, local API smoke.
- 2026-08-25 — Completed 06-payload-open-source: added OpenSource collection for homepage credibility items with GitHub/article links, stars, featured/order controls, and no public route; checks: generate:types, lint, build, test:int, local API smoke.
- 2026-08-25 — Completed 07-payload-cv: added CV global with formal profile fields, optional contacts/experience/skills/education/languages sections, optional PDF upload, and public read access; checks: generate:types, lint, build, test:int, local API smoke.
- 2026-08-26 — Completed 09-projects-index: added `/projects` as a server-rendered zero-design index with Payload sorting, optional preview images, textual status distinction for archived/future items, and links to project detail; checks: eslint, tsc --noEmit, build.
- 2026-08-26 — Completed 10-project-detail: added generic `/projects/:slug` page with async params, 404 handling, project meta, optional cover, rich content renderer, related posts by relationship or slug fallback, and contact/external links; checks: eslint, build.
- 2026-08-26 — Completed 11-posts-index: added `/posts` with published-only Payload query, category navigation, shared post list items with optional preview images, and meta for category/date/reading time/language; checks: eslint, tsc --noEmit, build.
- 2026-08-26 — Completed 12-post-category-page: added `/posts/category/:slug` with slug-to-category mapping, 404 handling for invalid categories, shared category nav/list reuse, and category-specific headers; checks: eslint, tsc --noEmit, build.
- 2026-08-26 — Completed 13-post-detail: added `/posts/:slug` with published-only slug lookup, zero-design detail header, optional cover image, rich content renderer, and adjacent navigation/back link; checks: eslint, tsc --noEmit, build.
- 2026-08-26 — Completed 14-cv-page: rebuilt `/cv` to match the mockup structure, moved public CV contacts to `SiteSettings`, added CV-specific profile/expertise fields, and kept empty sections hidden; checks: generate:types, eslint, tsc --noEmit, build.

Пиши сюда выполненные шаги.

```
```

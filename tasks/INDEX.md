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

* [ ] **02 — Base layout and zero design**
  Path: `02-base-layout-zero-design/task.md`
  Mockups: `02-base-layout-zero-design/mockups/`
  Goal: общий layout, header, footer, CSS-переменные, базовая типографика.

* [ ] **03 — Payload SiteSettings global**
  Path: `03-payload-site-settings/task.md`
  Goal: глобальные контакты, ссылки, availability, SEO defaults.

---

# Phase 2 — Payload content model

* [ ] **04 — Payload Projects collection**
  Path: `04-payload-projects/task.md`
  Goal: коллекция для `/projects` и `/projects/:slug`.

* [ ] **05 — Payload Posts collection**
  Path: `05-payload-posts/task.md`
  Goal: статьи, notes, guides, essays, case notes через `category`.

* [ ] **06 — Payload OpenSource collection**
  Path: `06-payload-open-source/task.md`
  Goal: open-source элементы для главной без отдельного публичного раздела.

* [ ] **07 — Payload CV global**
  Path: `07-payload-cv/task.md`
  Goal: данные онлайн-CV и ссылка на PDF.

---

# Phase 3 — Public pages

* [ ] **08 — Home page `/`**
  Path: `08-home-page/task.md`
  Mockups: `08-home-page/mockups/`
  Goal: Hero, Selected projects, Selected case notes, Open Source, From the blog, Contacts.

* [ ] **09 — Projects index `/projects`**
  Path: `09-projects-index/task.md`
  Mockups: `09-projects-index/mockups/`
  Goal: список проектов, не клиентское портфолио.

* [ ] **10 — Project detail `/projects/:slug`**
  Path: `10-project-detail/task.md`
  Mockups: `10-project-detail/mockups/`
  Goal: универсальная detail-страница проекта, включая Automatica.

* [ ] **11 — Posts index `/posts`**
  Path: `11-posts-index/task.md`
  Mockups: `11-posts-index/mockups/`
  Goal: общий индекс материалов с category links.

* [ ] **12 — Post category page `/posts/category/:slug`**
  Path: `12-post-category-page/task.md`
  Mockups: `12-post-category-page/mockups/`
  Goal: страницы категорий, особенно `/posts/category/cases` для case notes.

* [ ] **13 — Post detail `/posts/:slug`**
  Path: `13-post-detail/task.md`
  Mockups: `13-post-detail/mockups/`
  Goal: универсальный zero-design renderer для article/case/note/guide/essay.

* [ ] **14 — CV page `/cv`**
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
* [ ] `/projects` работает.
* [ ] `/projects/:slug` отдаёт страницу или 404.
* [ ] `/posts` работает.
* [ ] `/posts/category/:slug` работает и отдаёт 404 для неизвестной категории.
* [ ] `/posts/:slug` отдаёт страницу или 404.
* [ ] `/cv` работает и скрывает пустые блоки.
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

Пиши сюда выполненные шаги.

```
```

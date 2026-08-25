# AI tasks: personal website v2

Задачи нарезаны для поэтапной разработки сайта на Payload CMS + Next.js.

## Концепция

Сайт не строится как агентский сайт или фриланс-витрина. Это личный сайт builder-а / technical partner-а.

Основные разделы:

```txt
/
/projects
/projects/:slug
/posts
/posts/category/:slug
/posts/:slug
/cv
```

Не делаем на старте:

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

Кейсы оформляются как материалы в `Posts` с категорией `case`, а не как отдельная коллекция `Cases`.

Услуги раскрываются внутри проекта `Automatica`, а не через отдельную страницу `/services`.

Open Source остаётся credibility-блоком на главной, а не отдельным разделом.

## Рекомендуемый порядок

1. `01-init-blank-payload.md`
2. `02-base-layout-zero-design.md`
3. `03-payload-site-settings.md`
4. `04-payload-projects.md`
5. `05-payload-posts.md`
6. `06-payload-open-source.md`
7. `07-payload-cv.md`
8. `08-home-page.md`
9. `09-projects-index.md`
10. `10-project-detail.md`
11. `11-posts-index.md`
12. `12-post-category-page.md`
13. `13-post-detail.md`
14. `14-cv-page.md`
15. `15-shared-components.md`
16. `16-content-renderer.md`
17. `17-seo-metadata.md`
18. `18-sitemap-robots.md`
19. `19-analytics-adapter.md`
20. `20-seed-content.md`
21. `21-responsive-check.md`
22. `22-ui-cleanup.md`


## HTML mockups included

This archive also includes HTML mockups collected from the design discussion.
They are placed inside the related task folders under `mockups/`.

Important baseline decisions:
- Use `askold-home-contrast-v7.html` as the main zero-design visual baseline.
- Use `/projects`, not `/work`.
- `askold-work-page-v1.html` is included only as a legacy reference for the projects index layout. Adapt its naming and remove the idea that Work contains Projects + Cases + Open Source.
- Keep case notes inside Posts via category `case`, not as `/cases` routes.
- Keep Open Source on the home page, not inside `/projects`.
- Do not copy rejected visual patterns from older home iterations: chips, decorative cards, rounded blocks, excess dividers, weak gray hierarchy.

# Task 18. Настроить sitemap и robots

## Цель

Сделать базовую индексацию публичного сайта.

## Sitemap должен включать

```txt
/
/projects
/projects/:slug
/posts
/posts/category/:slug
/posts/:slug
/cv
```

## Не включать

- unpublished posts;
- unpublished projects;
- admin routes;
- preview/draft routes.

## Env

Production URL должен браться из env-переменной.

Пример:

```txt
NEXT_PUBLIC_SITE_URL=https://askoldastakhov.com
```

## Acceptance criteria

- Sitemap включает публичные страницы.
- Unpublished content не попадает в sitemap.
- Robots.txt настроен.
- Production URL берётся из env.

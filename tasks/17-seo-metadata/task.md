# Task 17. Настроить SEO metadata

## Цель

Добавить корректную metadata генерацию для публичных страниц.

## Страницы

```txt
/
/projects
/projects/:slug
/posts
/posts/category/:slug
/posts/:slug
/cv
```

## Источники

- `seo` поля конкретной сущности.
- `SiteSettings.seo` как fallback.
- `title` и `description`, если seo поля пустые.

## Требования

- Title.
- Description.
- Open Graph title/description/image.
- Canonical URL.
- Noindex для drafts/unpublished, если появится draft state.

## Acceptance criteria

- Title/description берутся из SEO полей или fallback.
- Open Graph работает.
- Canonical URL формируется корректно.
- Unpublished content не индексируется.

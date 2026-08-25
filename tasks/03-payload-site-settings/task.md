# Task 03. Создать Global SiteSettings

## Цель

Хранить общие настройки сайта, контакты и SEO defaults.

## Global

`SiteSettings`

## Поля

```ts
name
email
telegram
linkedin
github
location
availability
bookingUrl
seo
```

## Использование

`SiteSettings` должен использоваться в:

- header;
- footer;
- contacts section на главной;
- SEO fallback;
- CTA links.

## Acceptance criteria

- `SiteSettings` редактируется из Payload admin.
- Header/footer берут данные из `SiteSettings`.
- Контакты на главной берутся из `SiteSettings`.
- Предусмотрены fallback значения, чтобы публичные страницы не падали.
- SEO defaults доступны глобально.

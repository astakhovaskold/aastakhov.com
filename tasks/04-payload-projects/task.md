# Task 04. Создать коллекцию Projects

## Цель

Хранить проекты для `/projects` и `/projects/:slug`.

## Collection

`Projects`

## Поля

```ts
title
slug
description
status
type
role
startedAt
year
previewImage
coverImage
externalUrl
featured
order
content
relatedPosts
seo
```

## Enum: type

```txt
company
product
website
brand
concept
experiment
```

## Enum: status

```txt
active
in-progress
concept
paused
archived
future
```

## Логика

`Projects` - это не клиентские кейсы. Это компании, продукты, сайты, концепты, бренды и самостоятельные инициативы пользователя.

Примеры:

- Automatica;
- Personal website;
- Micro-SaaS concept;
- Physical brand concept.

## Acceptance criteria

- Можно создать проект в админке.
- Slug генерируется или задаётся вручную.
- `featured` и `order` работают для главной.
- `content` поддерживает rich text / blocks / MDX-compatible подход.
- Проект доступен на frontend.
- Коллекция не используется как клиентское портфолио.

# Task 10. Собрать страницу `/projects/:slug`

## Цель

Собрать детальную страницу проекта.

## Структура

```txt
Project header
Optional cover image
Content
Related posts
External/contact link
```

## Project header

Показывать:

```txt
title
description
status
role
type
year / startedAt
externalUrl, optional
```

## Automatica

Для проекта `Automatica` контент должен позволять раскрыть:

```txt
What it is
Why it exists
Current directions
Selected case notes
Related posts
Contact
```

Услуги Automatica раскрываются здесь, а не через `/services`.

## Acceptance criteria

- Страница работает для любого проекта.
- 404 для несуществующего slug.
- Related posts выводятся, если есть.
- External URL показывается, если задан.
- Один renderer подходит для всех проектов.
- Страница не превращается в агентский лендинг без отдельной задачи.

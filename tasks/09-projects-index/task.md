# Task 09. Собрать страницу `/projects`

## Цель

Собрать индекс всех проектов.

`/projects` заменяет прежнюю идею `/work`.

## Смысл страницы

Это не клиентское портфолио и не список кейсов. Это страница проектов, компаний, продуктов, сайтов, концептов и будущих инициатив.

## Структура

```txt
Page header
Projects list
```

## Project list item

Каждый проект показывает:

```txt
previewImage, optional
title
description
type
status
year
link to /projects/:slug
```

## Acceptance criteria

- Проекты сортируются по `order`, затем по году или дате.
- Archived/future проекты можно показывать, но визуально отличать текстом.
- На старте нет фильтров.
- Страница не выглядит как клиентское портфолио.
- Ссылка каждого проекта ведёт на `/projects/:slug`.


## Reference mockups in this folder

- Use `mockups/askold-work-page-v1.html` only as a legacy layout reference. The final route is `/projects`, and this page should be narrowed to Projects only.

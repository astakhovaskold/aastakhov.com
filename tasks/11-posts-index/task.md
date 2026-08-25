# Task 11. Собрать страницу `/posts`

## Цель

Собрать универсальный индекс материалов.

## Типы материалов

В `/posts` живут:

```txt
articles
case notes
technical notes
guides
essays
```

## Структура

```txt
Page header
Category links
Posts list
```

## Category links

```txt
All
Case notes
Articles
Notes
Guides
Essays
```

Маршруты:

```txt
/posts
/posts/category/cases
/posts/category/articles
/posts/category/notes
/posts/category/guides
/posts/category/essays
```

## Post list item

```txt
previewImage, optional
title
description
category
date
reading time
language
```

## Acceptance criteria

- Отображаются только опубликованные posts.
- Сортировка по `publishedAt` desc.
- Category links ведут на `/posts/category/:slug`.
- Preview image опционален.
- Language и readingTime отображаются в meta.
- Case notes не выводятся как отдельная коллекция.


## Reference mockups in this folder

- Use `mockups/askold-posts-page-v1.html` as the approved posts index reference.

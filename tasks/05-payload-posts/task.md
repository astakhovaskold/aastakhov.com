# Task 05. Создать коллекцию Posts

## Цель

Хранить статьи, заметки, case notes, guides и essays.

## Collection

`Posts`

## Поля

```ts
title
slug
description
content
publishedAt
updatedAt
language
readingTime
category
tags
previewImage
coverImage
featured
showOnHome
relatedProjects
seo
```

## Enum: category

```txt
article
case
note
guide
essay
```

В интерфейсе отображать так:

```txt
article -> Article
case -> Case note
note -> Note
guide -> Guide
essay -> Essay
```

## Enum: language

```txt
en
ru
es
```

## Логика

Кейсы не выносятся в отдельную коллекцию `Cases`.

Личные кейсы оформляются как `Posts.category = case`. Это позволяет показывать case notes на главной и в категории `/posts/category/cases`, не создавая агентский раздел `/cases`.

## Acceptance criteria

- Можно создать пост в админке.
- Пост может быть обычной статьёй или case note через `category`.
- `featured` и `showOnHome` используются на главной.
- Можно связать пост с проектом через `relatedProjects`.
- Пост отображается на `/posts/:slug`.
- Опубликованные посты сортируются по `publishedAt`.

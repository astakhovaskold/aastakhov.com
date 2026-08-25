# Task 13. Собрать страницу `/posts/:slug`

## Цель

Собрать универсальный renderer материала.

Один renderer должен работать для:

```txt
article
case
note
guide
essay
```

## Структура

```txt
Post header
Optional cover image
Content
Back to posts
Previous / Next, optional
Contacts/footer
```

## Post header

Показывать:

```txt
category
date
reading time
language
title
description
```

## Zero design ограничения

- Без sticky TOC.
- Без heavy related posts.
- Без карточной обвязки.
- Без декоративных captions по умолчанию.
- Текст в приоритете.

## Acceptance criteria

- Один renderer для article/case/note/guide/essay.
- Category выводится как label.
- Case note не имеет отдельного визуального шаблона.
- Rich content рендерится корректно.
- 404 для несуществующего slug.
- Есть ссылка назад на `/posts`.


## Reference mockups in this folder

- Use `mockups/askold-post-detail-zero-design-v2.html` as the approved post detail reference. `archive/askold-post-detail-page-v1.html` is too heavy and should not be copied directly.

# Task 12. Собрать страницу `/posts/category/:slug`

## Цель

Собрать страницу материалов одной категории.

## Маршруты

```txt
/posts/category/cases
/posts/category/articles
/posts/category/notes
/posts/category/guides
/posts/category/essays
```

## Маппинг slug -> category

```txt
cases -> case
articles -> article
notes -> note
guides -> guide
essays -> essay
```

## Заголовки

```txt
cases -> Case notes
articles -> Articles
notes -> Notes
guides -> Guides
essays -> Essays
```

## Описание для cases

```txt
Technical notes based on real product, architecture and delivery problems.
```

## Acceptance criteria

- Неверная категория отдаёт 404.
- Заголовок категории человекочитаемый.
- `/posts/category/cases` называется `Case notes`.
- Список использует тот же компонент, что `/posts`.
- Сортировка по `publishedAt` desc.

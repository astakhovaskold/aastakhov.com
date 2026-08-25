# Task 06. Создать коллекцию OpenSource

## Цель

Хранить open-source элементы для главной страницы.

## Collection

`OpenSource`

## Поля

```ts
name
description
githubUrl
articleUrl
stars
featured
order
```

## Логика

Open Source не является отдельным публичным разделом на старте.

Он используется как credibility-блок на главной странице и может ссылаться на:

- GitHub;
- внешний материал;
- `/posts/:slug`, если есть связанная статья.

## Acceptance criteria

- Можно создать open-source item.
- Featured items выводятся на главной.
- Ссылка может вести на GitHub или статью.
- Коллекция не создаёт отдельный публичный раздел `/open-source`.

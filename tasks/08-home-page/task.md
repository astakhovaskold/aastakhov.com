# Task 08. Собрать главную страницу `/`

## Цель

Собрать короткую витрину всей системы: кто пользователь, что он строит, как думает, какие материалы публикует, где его найти.

## Структура страницы

```txt
Hero
Selected projects
Selected case notes
Open Source
From the blog
Contacts
```

## Источники данных

- `SiteSettings` для контактов, location, availability.
- `Projects` where `featured = true` для `Selected projects`.
- `Posts` where `category = case` and `showOnHome = true` для `Selected case notes`.
- `OpenSource` where `featured = true` для `Open Source`.
- `Posts` where `category != case` and `showOnHome = true` для `From the blog`.

## Hero

Состав:

```txt
Location / availability
Primary positioning
Short descriptor
Avatar, optional
Topic links
```

## Selected case notes

Ссылка `All case notes` должна вести на:

```txt
/posts/category/cases
```

## Acceptance criteria

- Главная работает без демо-данных.
- Пустые секции не ломают layout.
- `Selected case notes` ведёт на `/posts/category/cases`.
- `Selected projects` ведёт на `/projects`.
- `Open Source` не ведёт на отдельный `/open-source` раздел.
- Визуально сохраняется zero design.


## Reference mockups in this folder

- Use `mockups/askold-home-contrast-v7.html` as the current approved home baseline.
- Older home mockups in `mockups/archive/` are included for context only, not as implementation targets.

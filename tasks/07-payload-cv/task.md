# Task 07. Создать Global CV

## Цель

Хранить данные для страницы `/cv`.

## Global

`CV`

## Поля

```ts
name
role
summary
contacts
experience
skills
education
languages
pdf
```

## Логика

`/cv` - это формальный профессиональный профиль. Он не должен заменять `/about` и не должен быть блоговой страницей.

## Acceptance criteria

- Данные CV редактируются из Payload admin.
- `/cv` берёт данные из Global `CV`.
- Есть ссылка на PDF.
- Если PDF не загружен, страница не ломается.
- Пустые секции скрываются.

# Task 01. Инициализировать проект

## Цель

Поднять чистый Payload CMS + Next.js проект без лишнего шаблона.

## Инструкция

Использовать `blank` template.

```bash
pnpm dlx create-payload-app@latest personal-site -t blank
```

Если используется npm:

```bash
npx create-payload-app@latest personal-site -t blank
```

## Требования

- Next.js App Router.
- TypeScript.
- ESLint.
- Payload CMS admin panel.
- Не использовать Tailwind.
- Не подключать UI-kit.
- Стили писать через обычный CSS: `globals.css` + CSS modules при необходимости.
- Не использовать `website` template, потому что он принесёт лишнюю блочную структуру, Tailwind и шаблонный frontend.

## Acceptance criteria

- Проект запускается локально.
- Доступна админка Payload.
- Работает публичный Next.js frontend.
- Нет лишней шаблонной структуры `website`.
- Базовый layout подключён.

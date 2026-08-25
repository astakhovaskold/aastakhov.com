# Task 19. Настроить analytics adapter

## Цель

Подготовить аналитику без жёсткой привязки к провайдеру.

## Требования

Создать analytics adapter с no-op реализацией по умолчанию.

Позже должен быть возможен переход на:

```txt
Plausible
GA4
```

## События

```txt
telegram_click
email_click
booking_click
cv_download
project_view
post_view
```

## Acceptance criteria

- Есть no-op adapter.
- Можно позже подключить Plausible или GA4.
- События не ломают страницу, если analytics env не задан.
- Click events подключены к контактам и CV download.

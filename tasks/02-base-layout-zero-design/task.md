# Task 02. Настроить базовый layout и zero design стили

## Цель

Зафиксировать визуальную основу сайта: text-first, высокий контраст, минимум декоративного UI.

## Инструкция

Создать общий layout для публичной части сайта.

Нужно добавить:

- общий `site` container;
- header;
- footer;
- базовую типографику;
- стили ссылок;
- spacing между секциями;
- responsive правила.

## CSS principles

Создать базовые CSS-переменные:

```css
:root {
  --text: #111111;
  --muted: #111111;
  --background: #ffffff;
  --container: 790px;
}
```

`--border` можно добавить только если реально понадобится.

## Запрещено без отдельной задачи

- карточный UI;
- чипсы;
- pills;
- скруглённые блоки;
- декоративные dividers;
- слабый серый текст для важного контента;
- иконки услуг;
- тяжёлые CTA-блоки;
- визуальный шум.

## Acceptance criteria

- Header и footer едины для всех страниц.
- Типографика похожа на текущий black/white макет.
- Страницы читаются без визуального шума.
- Mobile layout не ломается.
- На странице нет случайных декоративных элементов.


## Reference mockups in this folder

- See `mockups/askold-home-contrast-v7.html` as the main typography/layout baseline.

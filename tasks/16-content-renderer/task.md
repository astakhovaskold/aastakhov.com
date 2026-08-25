# Task 16. Создать content renderer

## Цель

Сделать единый renderer для rich content.

## Используется в

```txt
/projects/:slug
/posts/:slug
```

## Должен поддерживать

```txt
headings
paragraphs
lists
quotes
code
images
links
```

## Визуальные требования

- Текстовая колонка должна быть читабельной.
- Заголовки должны быть контрастными.
- Code blocks должны быть спокойными, без тяжёлой декоративной обвязки.
- Images inline, без визуального перегруза.
- Captions только если реально заданы в данных.

## Не делать

- sticky TOC;
- heavy related block;
- callout zoo;
- сложные layout blocks;
- cards внутри статьи без необходимости.

## Acceptance criteria

- Renderer корректно отображает basic rich content.
- Renderer не зависит от конкретной коллекции.
- Один и тот же renderer подходит для project detail и post detail.
- Типографика соответствует zero design.


## Reference mockups in this folder

- Use the post detail zero-design mockup as the renderer reference for headings, paragraphs, lists, quotes, code and images.

import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: {
    singular: 'Callout',
    plural: 'Callouts',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'note',
      options: [
        { label: 'Note (Заметка)', value: 'note' },
        { label: 'Tip (Совет)', value: 'tip' },
        { label: 'Warning (Предупреждение)', value: 'warning' },
        { label: 'Quote (Врезка / Мысль)', value: 'quote' },
      ],
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      localized: true,
    },
  ],
}

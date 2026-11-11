import type { Block } from 'payload'

export const DiagramBlock: Block = {
  slug: 'diagram',
  labels: {
    singular: 'Diagram',
    plural: 'Diagrams',
  },
  fields: [
    {
      name: 'chart',
      type: 'code',
      admin: {
        language: 'plaintext',
        description: 'Mermaid chart definition (e.g. flowchart TD; A-->B;)',
      },
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
  ],
}

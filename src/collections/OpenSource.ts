import type { CollectionConfig } from 'payload'

export const OpenSource: CollectionConfig = {
  slug: 'open-source',
  labels: {
    singular: 'Open Source Item',
    plural: 'Open Source',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'stars', 'featured', 'order', 'updatedAt'],
    group: 'Content',
    description:
      'Open-source work used as a credibility block on the home page, not a standalone public section.',
  },
  access: {
    read: () => true,
  },
  defaultSort: ['order', '-stars', '-updatedAt'],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'githubUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'GitHub repository URL.',
      },
    },
    {
      name: 'articleUrl',
      type: 'text',
      admin: {
        description: 'Optional external article URL or internal /posts/:slug path.',
      },
    },
    {
      name: 'stars',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  versions: {
    maxPerDoc: 20,
  },
}

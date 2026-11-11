import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: {
    singular: 'Topic',
    plural: 'Topics',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pillar', 'updatedAt'],
    group: 'Content',
    description: 'Subjects that group posts into hubs. Separate from the format category of a post.',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      localized: true,
    },
    slugField({
      useAsSlug: 'title',
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Introduction shown at the top of the topic hub page.',
      },
    },
    {
      name: 'pillar',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description: 'Optional pillar post. It is listed first on the hub and linked from every post in the topic.',
      },
    },
  ],
}

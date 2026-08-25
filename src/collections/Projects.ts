import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

const projectTypes = [
  'company',
  'product',
  'website',
  'brand',
  'concept',
  'experiment',
] as const

const projectStatuses = ['active', 'in-progress', 'concept', 'paused', 'archived', 'future'] as const

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'featured', 'order', 'updatedAt'],
    group: 'Content',
    description:
      'Products, companies, websites, concepts, brands, and independent initiatives. Not a client portfolio.',
  },
  access: {
    read: () => true,
  },
  defaultSort: ['order', '-year', '-updatedAt'],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    slugField({
      useAsSlug: 'title',
    }),
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: projectStatuses.map((status) => ({ label: status, value: status })),
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'product',
      options: projectTypes.map((type) => ({ label: type, value: type })),
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'Short role label, e.g. Founder, Technical partner, Architect.',
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
      min: 1990,
      max: 2100,
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'externalUrl',
      type: 'text',
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
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'relatedPosts',
      type: 'array',
      admin: {
        description:
          'Temporary post slug references. Convert to relationship after Posts collection is added.',
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  versions: {
    maxPerDoc: 20,
  },
}

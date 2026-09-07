import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'postCategory', 'publishedAt', 'featured', 'showOnHome'],
    group: 'Content',
    description: 'Articles, notes, case notes, guides, and essays.',
  },
  access: {
    read: () => true,
  },
  defaultSort: '-publishedAt',
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
      required: true,
      localized: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional eyebrow shown on the post detail page.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        description: 'Estimated reading time in minutes.',
        position: 'sidebar',
      },
      min: 1,
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'article',
      index: true,
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Case note', value: 'case' },
        { label: 'Note', value: 'note' },
        { label: 'Guide', value: 'guide' },
        { label: 'Essay', value: 'essay' },
      ],
      admin: {
        hidden: true,
      },
      required: false,
    },
    {
      name: 'postCategory',
      type: 'relationship',
      relationTo: 'post-categories',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      hasMany: true,
      relationTo: 'projects',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
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

import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

const postLanguages = ['en', 'ru', 'es'] as const

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'postCategory', 'language', 'publishedAt', 'featured', 'showOnHome'],
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
      name: 'eyebrow',
      type: 'text',
      admin: {
        description: 'Optional eyebrow shown on the post detail page.',
      },
    },
    {
      name: 'content',
      type: 'richText',
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
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: postLanguages.map((language) => ({ label: language, value: language })),
      required: true,
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

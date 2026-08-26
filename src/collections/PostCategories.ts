import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

const postCategoryKinds = [
  { label: 'Article', value: 'article' },
  { label: 'Case note', value: 'case' },
  { label: 'Note', value: 'note' },
  { label: 'Guide', value: 'guide' },
  { label: 'Essay', value: 'essay' },
] as const

export const PostCategories: CollectionConfig = {
  slug: 'post-categories',
  labels: {
    singular: 'Post category',
    plural: 'Post categories',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'slug', 'order'],
    group: 'Content',
    description: 'Configurable post categories used across the public posts pages.',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
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
      name: 'kind',
      type: 'select',
      options: [...postCategoryKinds],
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Semantic type used by the site for case notes, articles, notes, guides, and essays.',
      },
    },
    {
      name: 'singularLabel',
      type: 'text',
      required: true,
      admin: {
        description: 'Used in post meta and detail header, for example "Case note".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional introduction for the category page.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

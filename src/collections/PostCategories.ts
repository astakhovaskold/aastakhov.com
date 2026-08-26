import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const PostCategories: CollectionConfig = {
  slug: 'post-categories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'singularLabel', 'order'],
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
    {
      name: 'showInPostsNavigation',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Controls whether this category appears in the /posts navigation.',
        position: 'sidebar',
      },
    },
  ],
}

import type { Access, GlobalConfig } from 'payload'

const authenticatedOnly: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: authenticatedOnly,
    readVersions: authenticatedOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Askold Astakhov',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      defaultValue: 'astakhovaskold@gmail.com',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'telegram',
      type: 'text',
      defaultValue: 'https://t.me/askold_astakhov',
    },
    {
      name: 'linkedin',
      type: 'text',
      defaultValue: 'https://www.linkedin.com/in/askold-astakhov/',
    },
    {
      name: 'github',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
    },
    {
      name: 'availability',
      type: 'text',
      defaultValue: 'Available for selected projects',
      localized: true,
    },
    {
      name: 'homeEyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional eyebrow shown on the home page hero.',
      },
    },
    {
      name: 'projectsEyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional eyebrow shown on the projects index page.',
      },
    },
    {
      name: 'postsEyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional eyebrow shown on the posts index page.',
      },
    },
    {
      name: 'homePage',
      type: 'group',
      admin: {
        description: 'Editable hero copy for the home page.',
      },
      fields: [
        { name: 'heroTitleLine1', type: 'text', localized: true },
        { name: 'heroTitleLine2', type: 'text', localized: true },
        { name: 'heroDescription', type: 'textarea', localized: true },
        {
          name: 'heroTags',
          type: 'array',
          labels: { singular: 'Hero tag', plural: 'Hero tags' },
          fields: [{ name: 'title', type: 'text', required: true, localized: true }],
        },
      ],
    },
    {
      name: 'blogPage',
      type: 'group',
      admin: {
        description: 'Editable hero copy for the blog index page.',
      },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'projectsPage',
      type: 'group',
      admin: {
        description: 'Editable hero copy for the projects index page.',
      },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'bookingUrl',
      type: 'text',
    },
    {
      name: 'selectedWork',
      type: 'array',
      labels: {
        singular: 'Selected work item',
        plural: 'Selected work',
      },
      admin: {
        description:
          'Posts selected and ordered manually for the home page. Caption is a free-text label, not a post category.',
      },
      fields: [
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description: 'Short label shown to the right of the post, for example “Architecture”.',
          },
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      labels: {
        singular: 'Service',
        plural: 'Services',
      },
      admin: {
        description: 'Services shown on the home page. These do not have a separate collection or route.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
          required: true,
          defaultValue: 'Askold Astakhov',
          localized: true,
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          required: true,
          defaultValue: 'Personal site for Askold Astakhov.',
          localized: true,
        },
        {
          name: 'defaultImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}

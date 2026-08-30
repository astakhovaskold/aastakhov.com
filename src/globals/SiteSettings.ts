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
    },
    {
      name: 'availability',
      type: 'text',
      defaultValue: 'Available for selected projects',
    },
    {
      name: 'homeEyebrow',
      type: 'text',
      admin: {
        description: 'Optional eyebrow shown on the home page hero.',
      },
    },
    {
      name: 'projectsEyebrow',
      type: 'text',
      admin: {
        description: 'Optional eyebrow shown on the projects index page.',
      },
    },
    {
      name: 'postsEyebrow',
      type: 'text',
      admin: {
        description: 'Optional eyebrow shown on the posts index page.',
      },
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
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
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
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          required: true,
          defaultValue: 'Personal site for Askold Astakhov.',
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

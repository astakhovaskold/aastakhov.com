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
      name: 'bookingUrl',
      type: 'text',
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

import type { Access, GlobalConfig } from 'payload'

const authenticatedOnly: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const CV: GlobalConfig = {
  slug: 'cv',
  label: 'CV',
  admin: {
    group: 'Content',
    description: 'Formal professional profile data for the /cv page.',
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
      admin: {
        description: 'Name displayed on the formal CV page.',
      },
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'Current professional title or positioning.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short formal profile summary.',
      },
    },
    {
      name: 'contacts',
      type: 'group',
      admin: {
        description: 'Optional contact details for the CV page.',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'location',
          type: 'text',
        },
        {
          name: 'website',
          type: 'text',
        },
        {
          name: 'linkedin',
          type: 'text',
        },
        {
          name: 'github',
          type: 'text',
        },
        {
          name: 'telegram',
          type: 'text',
        },
      ],
    },
    {
      name: 'experience',
      type: 'array',
      admin: {
        description: 'Optional professional experience entries.',
      },
      fields: [
        {
          name: 'company',
          type: 'text',
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'location',
          type: 'text',
        },
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
        {
          name: 'current',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'summary',
          type: 'textarea',
        },
        {
          name: 'highlights',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'textarea',
            },
          ],
        },
      ],
    },
    {
      name: 'skills',
      type: 'array',
      admin: {
        description: 'Optional skill groups for the formal CV.',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'education',
      type: 'array',
      admin: {
        description: 'Optional education entries.',
      },
      fields: [
        {
          name: 'institution',
          type: 'text',
        },
        {
          name: 'degree',
          type: 'text',
        },
        {
          name: 'field',
          type: 'text',
        },
        {
          name: 'startYear',
          type: 'number',
          min: 1900,
          max: 2100,
        },
        {
          name: 'endYear',
          type: 'number',
          min: 1900,
          max: 2100,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'languages',
      type: 'array',
      admin: {
        description: 'Optional language proficiency entries.',
      },
      fields: [
        {
          name: 'language',
          type: 'text',
        },
        {
          name: 'level',
          type: 'text',
        },
      ],
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional PDF version of the CV.',
      },
    },
  ],
}

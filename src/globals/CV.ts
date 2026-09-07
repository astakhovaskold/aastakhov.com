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
      localized: true,
      admin: {
        description: 'Name displayed on the formal CV page.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional eyebrow shown above the CV title.',
      },
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      admin: {
        description: 'Current professional title or positioning.',
      },
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional current location shown in the profile summary.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short formal profile summary.',
      },
    },
    {
      name: 'focus',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional short focus line for the profile summary block.',
      },
    },
    {
      name: 'stack',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional primary stack line for the profile summary block.',
      },
    },
    {
      name: 'expertiseNote',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional short note shown next to the key expertise section title.',
      },
    },
    {
      name: 'expertise',
      type: 'array',
      admin: {
        description: 'Optional expertise cards shown before experience.',
      },
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
          localized: true,
        },
        {
          name: 'role',
          type: 'text',
          localized: true,
        },
        {
          name: 'location',
          type: 'text',
          localized: true,
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
          localized: true,
        },
        {
          name: 'stack',
          type: 'text',
          localized: true,
        },
        {
          name: 'highlights',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'textarea',
              localized: true,
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
          localized: true,
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              localized: true,
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
          localized: true,
        },
        {
          name: 'degree',
          type: 'text',
          localized: true,
        },
        {
          name: 'field',
          type: 'text',
          localized: true,
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
          localized: true,
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
          localized: true,
        },
        {
          name: 'level',
          type: 'text',
          localized: true,
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

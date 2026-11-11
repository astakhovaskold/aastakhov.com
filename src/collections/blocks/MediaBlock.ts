import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  labels: {
    singular: 'Media Block',
    plural: 'Media Blocks',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'isLoopingVideo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Autoplay, loop and mute (for animated GIFs/MP4 demonstrations)',
      },
    },
  ],
}

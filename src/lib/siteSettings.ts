import config from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'

export type HomeSelectedWork = {
  caption: string
  post: Post
}

export type HomeService = {
  description: string
  title: string
}

export type PublicSiteSettings = {
  name: string
  email: string
  phone?: string
  telegram?: string
  linkedin?: string
  github?: string
  location: string
  availability: string
  homeEyebrow?: string
  projectsEyebrow?: string
  postsEyebrow?: string
  bookingUrl?: string
  selectedWork: HomeSelectedWork[]
  services: HomeService[]
  seo: {
    defaultTitle: string
    defaultDescription: string
    defaultImage?: unknown
  }
}

export const fallbackSiteSettings: PublicSiteSettings = {
  name: 'Askold Astakhov',
  email: 'astakhovaskold@gmail.com',
  phone: undefined,
  telegram: 'https://t.me/askold_astakhov',
  linkedin: 'https://www.linkedin.com/in/askold-astakhov/',
  location: 'Madrid',
  availability: 'Available for selected projects',
  selectedWork: [],
  services: [],
  seo: {
    defaultTitle: 'Askold Astakhov',
    defaultDescription: 'Personal site for Askold Astakhov.',
  },
}

function optionalString(value: null | string | undefined): string | undefined {
  return value || undefined
}

function populatedPost(value: null | number | Post | undefined): value is Post {
  return typeof value === 'object' && value !== null && 'slug' in value
}

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return fallbackSiteSettings
  }

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })

    return {
      ...fallbackSiteSettings,
      name: settings.name || fallbackSiteSettings.name,
      email: settings.email || fallbackSiteSettings.email,
      phone: optionalString(settings.phone),
      telegram: optionalString(settings.telegram) || fallbackSiteSettings.telegram,
      linkedin: optionalString(settings.linkedin) || fallbackSiteSettings.linkedin,
      github: optionalString(settings.github),
      location: settings.location || fallbackSiteSettings.location,
      availability: settings.availability || fallbackSiteSettings.availability,
      homeEyebrow: optionalString(settings.homeEyebrow),
      projectsEyebrow: optionalString(settings.projectsEyebrow),
      postsEyebrow: optionalString(settings.postsEyebrow),
      bookingUrl: optionalString(settings.bookingUrl),
      selectedWork: (settings.selectedWork || []).flatMap((item) =>
        populatedPost(item.post) && item.caption ? [{ caption: item.caption, post: item.post }] : [],
      ),
      services: (settings.services || []).flatMap((service) =>
        service.title && service.description
          ? [{ description: service.description, title: service.title }]
          : [],
      ),
      seo: {
        ...fallbackSiteSettings.seo,
        ...settings.seo,
      },
    }
  } catch {
    return fallbackSiteSettings
  }
}

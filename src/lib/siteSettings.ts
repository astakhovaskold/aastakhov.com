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

export type HomePageCopy = {
  heroDescription: string
  heroTags: string[]
  heroTitleLine1: string
  heroTitleLine2: string
}

export type IndexPageCopy = {
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
  homePage: HomePageCopy
  blogPage: IndexPageCopy
  projectsPage: IndexPageCopy
  bookingUrl?: string
  selectedWork: HomeSelectedWork[]
  services: HomeService[]
  seo: {
    defaultTitle: string
    defaultDescription: string
    defaultImage?: unknown
  }
}

function fallbackSiteSettings(locale: string): PublicSiteSettings {
  const isRussian = locale === 'ru'

  return {
    name: 'Askold Astakhov',
    email: 'astakhovaskold@gmail.com',
    phone: undefined,
    telegram: 'https://t.me/askold_astakhov',
    linkedin: 'https://www.linkedin.com/in/askold-astakhov/',
    location: 'Madrid',
    availability: 'Available for selected projects',
    homePage: isRussian
    ? {
        heroDescription:
          'Технический партнёр для сложных проектов — архитектура, аудиты, консалтинг и разработка. Опыт в enterprise, прагматичный подход.',
        heroTags: ['Архитектура', 'Аудиты', 'Технический консалтинг', 'Full-stack разработка', 'Team lead'],
        heroTitleLine1: 'Независимый',
        heroTitleLine2: 'IT-эксперт',
      }
    : {
        heroDescription:
          'Technical partner for complex projects — architecture, audits, consulting and development. Enterprise background, pragmatic approach.',
        heroTags: ['Architecture', 'Audits', 'Technical consulting', 'Full-stack dev', 'Team lead'],
        heroTitleLine1: 'Independent',
        heroTitleLine2: 'IT expert',
      },
    blogPage: isRussian
    ? {
        description: 'Статьи, заметки, кейсы и практические материалы о разработке цифровых продуктов.',
        title: 'Блог',
      }
    : {
        description: 'Writing, notes, case studies, and practical material on building digital products.',
        title: 'Blog',
      },
    projectsPage: isRussian
    ? {
        description:
          'Продукты, компании, сайты, концепты, эксперименты и будущие инициативы. Это список проектов, а не клиентское портфолио.',
        title: 'Проекты',
      }
    : {
        description:
          'Products, companies, websites, concepts, experiments, and future initiatives. This is an index of projects, not a client portfolio.',
        title: 'Projects',
      },
    selectedWork: [],
    services: [],
    seo: {
      defaultTitle: 'Askold Astakhov',
      defaultDescription: 'Personal site for Askold Astakhov.',
    },
  }
}

function optionalString(value: null | string | undefined): string | undefined {
  return value || undefined
}

function populatedPost(value: null | number | Post | undefined): value is Post {
  return typeof value === 'object' && value !== null && 'slug' in value
}

export async function getSiteSettings(locale: string): Promise<PublicSiteSettings> {
  const fallback = fallbackSiteSettings(locale)

  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return fallback
  }

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
    })

    return {
      ...fallback,
      name: settings.name || fallback.name,
      email: settings.email || fallback.email,
      phone: optionalString(settings.phone),
      telegram: optionalString(settings.telegram) || fallback.telegram,
      linkedin: optionalString(settings.linkedin) || fallback.linkedin,
      github: optionalString(settings.github),
      location: settings.location || fallback.location,
      availability: settings.availability || fallback.availability,
      homeEyebrow: optionalString(settings.homeEyebrow),
      projectsEyebrow: optionalString(settings.projectsEyebrow),
      postsEyebrow: optionalString(settings.postsEyebrow),
      homePage: {
        heroDescription: settings.homePage?.heroDescription || fallback.homePage.heroDescription,
        heroTags: settings.homePage?.heroTags?.length
          ? settings.homePage.heroTags.flatMap((tag) => (tag.title ? [tag.title] : []))
          : fallback.homePage.heroTags,
        heroTitleLine1: settings.homePage?.heroTitleLine1 || fallback.homePage.heroTitleLine1,
        heroTitleLine2: settings.homePage?.heroTitleLine2 || fallback.homePage.heroTitleLine2,
      },
      blogPage: {
        description: settings.blogPage?.description || fallback.blogPage.description,
        title: settings.blogPage?.title || fallback.blogPage.title,
      },
      projectsPage: {
        description: settings.projectsPage?.description || fallback.projectsPage.description,
        title: settings.projectsPage?.title || fallback.projectsPage.title,
      },
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
        ...fallback.seo,
        ...settings.seo,
      },
    }
  } catch {
    return fallback
  }
}

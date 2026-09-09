import type { MigrateUpArgs } from '@payloadcms/db-postgres'

type PageCopyDefaults = {
  blogPage: { description: string; title: string }
  homePage: {
    heroDescription: string
    heroTags: { title: string }[]
    heroTitleLine1: string
    heroTitleLine2: string
  }
  projectsPage: { description: string; title: string }
}

const defaults: Record<'en' | 'ru', PageCopyDefaults> = {
  ru: {
    homePage: {
      heroDescription:
        'Технический партнёр для сложных проектов — архитектура, аудиты, консалтинг и разработка. Опыт в enterprise, прагматичный подход.',
      heroTags: [
        { title: 'Архитектура' },
        { title: 'Аудиты' },
        { title: 'Технический консалтинг' },
        { title: 'Full-stack разработка' },
        { title: 'Team lead' },
      ],
      heroTitleLine1: 'Независимый',
      heroTitleLine2: 'IT-эксперт',
    },
    blogPage: {
      description: 'Статьи, заметки, кейсы и практические материалы о разработке цифровых продуктов.',
      title: 'Блог',
    },
    projectsPage: {
      description:
        'Продукты, компании, сайты, концепты, эксперименты и будущие инициативы. Это список проектов, а не клиентское портфолио.',
      title: 'Проекты',
    },
  },
  en: {
    homePage: {
      heroDescription:
        'Technical partner for complex projects — architecture, audits, consulting and development. Enterprise background, pragmatic approach.',
      heroTags: [
        { title: 'Architecture' },
        { title: 'Audits' },
        { title: 'Technical consulting' },
        { title: 'Full-stack dev' },
        { title: 'Team lead' },
      ],
      heroTitleLine1: 'Independent',
      heroTitleLine2: 'IT expert',
    },
    blogPage: {
      description: 'Writing, notes, case studies, and practical material on building digital products.',
      title: 'Blog',
    },
    projectsPage: {
      description:
        'Products, companies, websites, concepts, experiments, and future initiatives. This is an index of projects, not a client portfolio.',
      title: 'Projects',
    },
  },
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const locale of ['ru', 'en'] as const) {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      locale,
      fallbackLocale: false,
      req,
    })
    const pageCopy = defaults[locale]

    await payload.updateGlobal({
      slug: 'site-settings',
      locale,
      data: {
        homePage: {
          ...settings.homePage,
          heroDescription: settings.homePage?.heroDescription || pageCopy.homePage.heroDescription,
          heroTags:
            settings.homePage?.heroTags?.length ? settings.homePage.heroTags : pageCopy.homePage.heroTags,
          heroTitleLine1: settings.homePage?.heroTitleLine1 || pageCopy.homePage.heroTitleLine1,
          heroTitleLine2: settings.homePage?.heroTitleLine2 || pageCopy.homePage.heroTitleLine2,
        },
        blogPage: {
          ...settings.blogPage,
          description: settings.blogPage?.description || pageCopy.blogPage.description,
          title: settings.blogPage?.title || pageCopy.blogPage.title,
        },
        projectsPage: {
          ...settings.projectsPage,
          description: settings.projectsPage?.description || pageCopy.projectsPage.description,
          title: settings.projectsPage?.title || pageCopy.projectsPage.title,
        },
      },
      req,
    })
  }
}

export async function down(): Promise<void> {
  // Page copy is editorial content; preserve it if this migration is rolled back.
}

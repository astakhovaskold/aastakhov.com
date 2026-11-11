import type { MigrateUpArgs } from '@payloadcms/db-postgres'

const genericValues = {
  en: {
    titles: ['Askold Astakhov', ''],
    descriptions: ['Personal site for Askold Astakhov.', ''],
  },
  ru: {
    titles: ['Аскольд Астахов', 'Askold Astakhov', ''],
    descriptions: ['Персональный сайт Аскольда Астахова.', 'Personal site for Askold Astakhov.', ''],
  },
}

const defaults = {
  en: {
    defaultDescription:
      'Askold Astakhov is a frontend architect and tech lead. Architecture, audits and consulting for complex React and Next.js products.',
    defaultTitle: 'Askold Astakhov — Frontend Architect & Tech Lead',
  },
  ru: {
    defaultDescription:
      'Аскольд Астахов — frontend-архитектор и технический лидер. Архитектура, аудиты и консалтинг для сложных продуктов на React и Next.js.',
    defaultTitle: 'Аскольд Астахов — Frontend-архитектор и технический лидер',
  },
} as const

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const locale of ['ru', 'en'] as const) {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      locale,
      fallbackLocale: false,
      req,
    })
    const current = settings.seo
    const values = genericValues[locale]

    // Only replace the generic defaults; copy the owner already edited stays.
    const title = values.titles.includes(current?.defaultTitle ?? '')
      ? defaults[locale].defaultTitle
      : current?.defaultTitle
    const description = values.descriptions.includes(current?.defaultDescription ?? '')
      ? defaults[locale].defaultDescription
      : current?.defaultDescription

    await payload.updateGlobal({
      slug: 'site-settings',
      locale,
      data: {
        seo: {
          ...current,
          defaultDescription: description,
          defaultTitle: title,
        },
      },
      req,
    })
  }
}

export async function down(): Promise<void> {
  // SEO copy is editorial content; preserve it if this migration is rolled back.
}

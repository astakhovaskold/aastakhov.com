import type { MigrateUpArgs } from '@payloadcms/db-postgres'

import {
  ALTERNATE_NAME,
  KNOWS_ABOUT,
  ROLE,
  ruCv,
  ruExperience,
  siteSettingsByLocale,
} from './data/owner-decisions'

type Locale = 'en' | 'ru'
type Row = { id?: null | string } & Record<string, unknown>

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Data for an array whose rows are shared across locales: reuse an existing row id by index. */
function withExistingIds<T extends Record<string, unknown>>(existing: Row[] | null | undefined, items: readonly T[]) {
  return items.map((item, index) => ({ ...(existing?.[index]?.id ? { id: existing[index].id } : {}), ...item }))
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const locale of ['ru', 'en'] as Locale[]) {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      fallbackLocale: false,
      locale,
      req,
    })
    const decided = siteSettingsByLocale[locale]
    const existingProof = (settings.proof ?? []) as Row[]
    const proofIsEmpty = existingProof.every((row) => !hasText(row.title))

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        availability: decided.availability,
        homeEyebrow: decided.homeEyebrow,
        jobTitle: settings.jobTitle || decided.jobTitle,
        location: decided.location,
        description: settings.description || decided.description,
        ...(proofIsEmpty ? { proof: withExistingIds(existingProof, decided.proof) } : {}),
        ...(locale === 'ru'
          ? {
              alternateName: settings.alternateName || ALTERNATE_NAME,
              knowsAbout: settings.knowsAbout?.length
                ? settings.knowsAbout
                : KNOWS_ABOUT.map((title) => ({ title })),
            }
          : {}),
      },
      locale,
      req,
    })
  }

  // EN CV: only the headline role changes (owner decision: one role everywhere).
  await payload.updateGlobal({ slug: 'cv', data: { role: ROLE }, locale: 'en', req })

  // RU CV: synced with the EN CV for role, location, summary, expertise and experience, so the
  // team size, job titles and metrics agree. Skills and education are left as they are.
  const ru = await payload.findGlobal({ slug: 'cv', depth: 0, fallbackLocale: false, locale: 'ru', req })

  if (!ru.experience?.length) return

  const experience = ru.experience.map((row) => {
    const update = ruExperience.find((item) => item.company === row.company)

    if (!update) return row

    return {
      ...row,
      highlights: (row.highlights ?? []).map((highlight, index) => ({
        ...highlight,
        text: update.highlights[index] ?? highlight.text,
      })),
      location: update.location,
      role: update.role,
      stack: update.stack,
      summary: update.summary,
    }
  })

  await payload.updateGlobal({
    slug: 'cv',
    data: {
      expertise: withExistingIds((ru.expertise ?? []) as Row[], ruCv.expertise),
      expertiseNote: ruCv.expertiseNote,
      experience,
      focus: ruCv.focus,
      location: ruCv.location,
      role: ruCv.role,
      stack: ruCv.stack,
      summary: ruCv.summary,
    },
    locale: 'ru',
    req,
  })
}

export async function down(): Promise<void> {
  // This migration writes editorial content; rolling it back keeps the content.
}

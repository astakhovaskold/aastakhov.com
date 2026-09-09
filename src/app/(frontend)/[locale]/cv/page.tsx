import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ArrowLink } from '@/components/site/arrow-link'
import { StructuredData } from '@/components/site/structured-data'
import { routing } from '@/i18n/routing'
import { analyticsEventNames, getContactLinkEvent } from '@/lib/analytics'
import { getCV } from '@/lib/cv'
import { createSeoMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'
import { createBreadcrumbSchema, createProfilePageSchema } from '@/lib/structured-data'

type CVPageProps = {
  params: Promise<{ locale: string }>
}

type ContactItem = {
  href?: string
  label: string
  value: string
}

function hasText(value: null | string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeUrl(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  return `https://${value}`
}

function formatContactHref(type: string, value: string): string | undefined {
  switch (type) {
    case 'email':
      return `mailto:${value}`
    case 'phone':
      return `tel:${value.replace(/\s+/g, '')}`
    case 'website':
    case 'linkedin':
    case 'github':
      return normalizeUrl(value)
    case 'telegram':
      if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('tg://')
      ) {
        return value
      }

      return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : `https://t.me/${value}`
    default:
      return undefined
  }
}

function getContactItems(
  contacts:
    | {
        email?: null | string
        github?: null | string
        linkedin?: null | string
        phone?: null | string
        telegram?: null | string
      }
    | null
    | undefined,
  contactT: (key: string) => string,
): ContactItem[] {
  if (!contacts) {
    return []
  }

  const items = [
    { key: 'email', label: contactT('email'), value: contacts.email },
    { key: 'phone', label: contactT('phone'), value: contacts.phone },
    { key: 'linkedin', label: contactT('linkedin'), value: contacts.linkedin },
    { key: 'github', label: contactT('github'), value: contacts.github },
    { key: 'telegram', label: contactT('telegram'), value: contacts.telegram },
  ]

  return items
    .filter((item): item is { key: string; label: string; value: string } => hasText(item.value))
    .map((item) => ({
      href: formatContactHref(item.key, item.value),
      label: item.label,
      value: item.value,
    }))
}

function formatMonthYear(value: null | string | undefined, locale: string): string | null {
  if (!hasText(value)) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.valueOf())) {
    return null
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatExperienceRange(
  startDate: null | string | undefined,
  endDate: null | string | undefined,
  current: boolean | null | undefined,
  presentLabel: string,
  locale: string,
): string | null {
  const start = formatMonthYear(startDate, locale)
  const end = current ? presentLabel : formatMonthYear(endDate, locale)

  if (start && end) {
    return `${start} - ${end}`
  }

  return start || end || null
}

function formatEducationRange(
  startYear: null | number | undefined,
  endYear: null | number | undefined,
): string | null {
  if (startYear && endYear) {
    return `${startYear} - ${endYear}`
  }

  if (startYear) {
    return String(startYear)
  }

  if (endYear) {
    return String(endYear)
  }

  return null
}

function formatSummaryPairs(cv: Awaited<ReturnType<typeof getCV>>, t: (key: string) => string) {
  if (!cv) {
    return []
  }

  return [
    { label: t('role'), value: cv.role },
    { label: t('location'), value: cv.location },
    { label: t('focus'), value: cv.focus },
    { label: t('stack'), value: cv.stack },
  ].filter((item): item is { label: string; value: string } => hasText(item.value))
}

function splitName(value: null | string | undefined, fallback: string): string[] {
  if (!hasText(value)) {
    return [fallback]
  }

  const parts = value.trim().split(/\s+/)

  if (parts.length < 2) {
    return [value]
  }

  return [parts[0], parts.slice(1).join(' ')]
}

export async function generateMetadata({ params }: CVPageProps): Promise<Metadata> {
  const { locale } = await params
  const [cv, settings, t] = await Promise.all([
    getCV(locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'cv' }),
  ])
  const titleParts = [cv?.name || t('cvFallback'), cv?.role || null].filter(Boolean)

  return createSeoMetadata({
    canonicalPath: '/cv',
    description: cv?.summary || t('defaultDescription'),
    locale: locale as 'ru' | 'en',
    settings,
    title: titleParts.join(' - '),
  })
}

export default async function CVPage({ params }: CVPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [cv, siteSettings, t, contactT] = await Promise.all([
    getCV(locale),
    getSiteSettings(locale),
    getTranslations('cv'),
    getTranslations('contact'),
  ])
  const contactItems = getContactItems(
    {
      email: siteSettings.email,
      phone: siteSettings.phone,
      linkedin: siteSettings.linkedin,
      github: siteSettings.github,
      telegram: siteSettings.telegram,
    },
    contactT,
  )
  const summaryPairs = formatSummaryPairs(cv, t)
  const expertiseItems =
    cv?.expertise?.filter((item) => hasText(item.title) || hasText(item.description)) ?? []
  const experienceItems =
    cv?.experience?.filter(
      (item) =>
        hasText(item.company) ||
        hasText(item.role) ||
        hasText(item.summary) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        Boolean(item.highlights?.some((highlight) => hasText(highlight.text))),
    ) ?? []
  const skillGroups =
    cv?.skills?.filter(
      (item) => hasText(item.category) || Boolean(item.items?.some((skill) => hasText(skill.name))),
    ) ?? []
  const educationItems =
    cv?.education?.filter(
      (item) =>
        hasText(item.institution) ||
        hasText(item.degree) ||
        hasText(item.field) ||
        hasText(item.description) ||
        typeof item.startYear === 'number' ||
        typeof item.endYear === 'number',
    ) ?? []
  const languageItems =
    cv?.languages?.filter((item) => hasText(item.language) || hasText(item.level)) ?? []
  const headerActions = [
    cv?.pdf?.url
      ? {
          href: cv.pdf.url,
          label: t('downloadPdf'),
          rel: 'noreferrer',
          target: '_blank',
          trackingEvent: analyticsEventNames.cvDownload,
        }
      : null,
    {
      href: `mailto:${siteSettings.email}`,
      label: contactT('email'),
    },
    siteSettings.linkedin
      ? {
          href: siteSettings.linkedin,
          label: contactT('linkedin'),
        }
      : null,
    siteSettings.telegram
      ? {
          href: siteSettings.telegram,
          label: contactT('telegram'),
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    label: string
    rel?: string
    target?: string
    trackingEvent?: (typeof analyticsEventNames)[keyof typeof analyticsEventNames]
  }>

  const hasStructuredContent =
    hasText(cv?.summary) ||
    summaryPairs.length > 0 ||
    expertiseItems.length > 0 ||
    contactItems.length > 0 ||
    experienceItems.length > 0 ||
    skillGroups.length > 0 ||
    educationItems.length > 0 ||
    languageItems.length > 0 ||
    Boolean(cv?.pdf?.url)

  return (
    <>
      <StructuredData
        data={[
          createProfilePageSchema({
            description: cv?.summary || t('defaultDescription'),
            locale: locale as 'en' | 'ru',
            path: '/cv',
            title: cv?.name || t('cvFallback'),
          }),
          createBreadcrumbSchema(locale as 'en' | 'ru', [
            { name: siteSettings.name, path: '/' },
            { name: cv?.name || t('cvFallback'), path: '/cv' },
          ]),
        ]}
      />
      <header className="cv-header">
        {hasText(cv?.eyebrow) ? <p className="eyebrow">{cv.eyebrow}</p> : null}
        <h1 className="cv-title">
          {splitName(cv?.name, t('cvFallback')).map((part, index) => (
            <span key={`${part}-${index}`}>
              {index > 0 ? <br /> : null}
              {part}
            </span>
          ))}
        </h1>
        {hasText(cv?.summary) ? <p className="cv-subtitle">{cv.summary}</p> : null}

        {headerActions.length > 0 ? (
          <div className="header-actions" aria-label="CV actions">
            {headerActions.map((action) => (
              <ArrowLink
                href={action.href}
                key={action.label}
                rel={action.rel}
                target={action.target}
                trackingEvent={
                  action.trackingEvent || getContactLinkEvent(action.label, action.href)
                }
              >
                {action.label}
              </ArrowLink>
            ))}
          </div>
        ) : null}
      </header>

      {summaryPairs.length > 0 ? (
        <section className="summary-grid" aria-labelledby="profile-title">
          <h2 className="section-title" id="profile-title">
            {t('profile')}
          </h2>

          <dl className="summary-list">
            {summaryPairs.map((item) => (
              <div className="summary-item" key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {expertiseItems.length > 0 ? (
        <section className="section" aria-labelledby="expertise-title">
          <div className="section-header">
            <h2 className="section-title" id="expertise-title">
              {t('keyExpertise')}
            </h2>
            {hasText(cv?.expertiseNote) ? <p className="section-note">{cv.expertiseNote}</p> : null}
          </div>

          <div className="skills-grid">
            {expertiseItems.map((item) => (
              <article className="skill-group" key={item.id}>
                {hasText(item.title) ? <h3>{item.title}</h3> : null}
                {hasText(item.description) ? <p>{item.description}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {experienceItems.length > 0 ? (
        <section className="section" aria-labelledby="experience-title">
          <div className="section-header">
            <h2 className="section-title" id="experience-title">
              {t('experience')}
            </h2>
          </div>

          <div className="experience-list">
            {experienceItems.map((item) => {
              const dateRange = formatExperienceRange(
                item.startDate,
                item.endDate,
                item.current,
                t('present'),
                locale,
              )

              return (
                <article className="experience-item" key={item.id}>
                  <div className="experience-meta">
                    {hasText(item.company) ? (
                      <p className="experience-company">{item.company}</p>
                    ) : null}
                    {dateRange ? <p className="experience-period">{dateRange}</p> : null}
                    {hasText(item.location) ? <p>{item.location}</p> : null}
                  </div>

                  <div className="experience-body">
                    {hasText(item.role) ? <h3 className="experience-role">{item.role}</h3> : null}
                    {hasText(item.summary) ? <p>{item.summary}</p> : null}

                    {item.highlights?.some((highlight) => hasText(highlight.text)) ? (
                      <ul>
                        {item.highlights.map((highlight) =>
                          hasText(highlight.text) ? (
                            <li key={highlight.id}>{highlight.text}</li>
                          ) : null,
                        )}
                      </ul>
                    ) : null}

                    {hasText(item.stack) ? (
                      <p className="stack">{t('stackLabel', { stack: item.stack })}</p>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {skillGroups.length > 0 ? (
        <section className="section" aria-labelledby="skills-title">
          <div className="section-header">
            <h2 className="section-title" id="skills-title">
              {t('technology')}
            </h2>
          </div>

          <div className="skills-grid">
            {skillGroups.map((group) => {
              const items = group.items?.filter((skill) => hasText(skill.name)) ?? []

              return (
                <article className="skill-group" key={group.id}>
                  {hasText(group.category) ? <h3>{group.category}</h3> : null}
                  {items.length > 0 ? <p>{items.map((skill) => skill.name).join(', ')}</p> : null}
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {educationItems.length > 0 ? (
        <section className="section" aria-labelledby="education-title">
          <div className="section-header">
            <h2 className="section-title" id="education-title">
              {t('education')}
            </h2>
          </div>

          <div className="education-list">
            {educationItems.map((item) => {
              const dateRange = formatEducationRange(item.startYear, item.endYear)
              const title = [item.degree, item.field].filter(hasText).join(' · ')

              return (
                <div className="education-item" key={item.id}>
                  {dateRange ? <p className="education-meta">{dateRange}</p> : <div />}
                  <div>
                    {title ? <p className="education-title">{title}</p> : null}
                    {hasText(item.institution) ? (
                      <p className="education-desc">{item.institution}</p>
                    ) : null}
                    {hasText(item.description) ? (
                      <p className="education-desc">{item.description}</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {languageItems.length > 0 ? (
        <section className="section" aria-labelledby="languages-title">
          <div className="section-header">
            <h2 className="section-title" id="languages-title">
              {t('languages')}
            </h2>
          </div>

          <div className="languages">
            {languageItems.map((item) => (
              <span key={item.id}>{[item.language, item.level].filter(hasText).join(' · ')}</span>
            ))}
          </div>
        </section>
      ) : null}

      {contactItems.length > 0 ? (
        <section className="section" aria-labelledby="contact-title">
          <div className="section-header">
            <h2 className="section-title" id="contact-title">
              {t('contacts')}
            </h2>
          </div>

          <div className="contacts">
            {contactItems.map((item) =>
              item.href ? (
                <ArrowLink
                  href={item.href}
                  key={item.label}
                  trackingEvent={getContactLinkEvent(item.label, item.href)}
                >
                  {item.label}
                </ArrowLink>
              ) : null,
            )}
            {cv?.pdf?.url ? (
              <ArrowLink
                href={cv.pdf.url}
                rel="noreferrer"
                target="_blank"
                trackingEvent={analyticsEventNames.cvDownload}
              >
                {t('downloadPdf')}
              </ArrowLink>
            ) : null}
          </div>
        </section>
      ) : null}

      {!hasStructuredContent ? (
        <section className="section">
          <p>{t('noContent')}</p>
        </section>
      ) : null}
    </>
  )
}

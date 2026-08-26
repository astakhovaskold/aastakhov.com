import type { Metadata } from 'next'

import { getCV } from '@/lib/cv'
import { getSiteSettings } from '@/lib/siteSettings'

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
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('tg://')) {
        return value
      }

      return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : `https://t.me/${value}`
    default:
      return undefined
  }
}

function getContactItems(
  contacts: {
    email?: null | string
    github?: null | string
    linkedin?: null | string
    phone?: null | string
    telegram?: null | string
  } | null | undefined,
): ContactItem[] {
  if (!contacts) {
    return []
  }

  const items = [
    { key: 'email', label: 'Email', value: contacts.email },
    { key: 'phone', label: 'Phone', value: contacts.phone },
    { key: 'linkedin', label: 'LinkedIn', value: contacts.linkedin },
    { key: 'github', label: 'GitHub', value: contacts.github },
    { key: 'telegram', label: 'Telegram', value: contacts.telegram },
  ]

  return items
    .filter((item): item is { key: string; label: string; value: string } => hasText(item.value))
    .map((item) => ({
      href: formatContactHref(item.key, item.value),
      label: item.label,
      value: item.value,
    }))
}

function formatMonthYear(value: null | string | undefined): string | null {
  if (!hasText(value)) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.valueOf())) {
    return null
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatExperienceRange(
  startDate: null | string | undefined,
  endDate: null | string | undefined,
  current: boolean | null | undefined,
): string | null {
  const start = formatMonthYear(startDate)
  const end = current ? 'Present' : formatMonthYear(endDate)

  if (start && end) {
    return `${start} - ${end}`
  }

  return start || end || null
}

function formatEducationRange(startYear: null | number | undefined, endYear: null | number | undefined): string | null {
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

function formatSummaryPairs(cv: Awaited<ReturnType<typeof getCV>>) {
  if (!cv) {
    return []
  }

  return [
    { label: 'Role', value: cv.role },
    { label: 'Location', value: cv.location },
    { label: 'Focus', value: cv.focus },
    { label: 'Stack', value: cv.stack },
  ].filter((item): item is { label: string; value: string } => hasText(item.value))
}

function splitName(value: null | string | undefined): string[] {
  if (!hasText(value)) {
    return ['CV']
  }

  const parts = value.trim().split(/\s+/)

  if (parts.length < 2) {
    return [value]
  }

  return [parts[0], parts.slice(1).join(' ')]
}

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCV()
  const titleParts = [cv?.name || 'CV', cv?.role || null].filter(Boolean)

  return {
    description: cv?.summary || 'Professional profile and CV.',
    title: titleParts.join(' - '),
  }
}

export default async function CVPage() {
  const [cv, siteSettings] = await Promise.all([getCV(), getSiteSettings()])
  const contactItems = getContactItems({
    email: siteSettings.email,
    phone: siteSettings.phone,
    linkedin: siteSettings.linkedin,
    github: siteSettings.github,
    telegram: siteSettings.telegram,
  })
  const summaryPairs = formatSummaryPairs(cv)
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
          label: 'Download PDF',
          rel: 'noreferrer',
          target: '_blank',
        }
      : null,
    {
      href: `mailto:${siteSettings.email}`,
      label: 'Email',
    },
    siteSettings.linkedin
      ? {
          href: siteSettings.linkedin,
          label: 'LinkedIn',
        }
      : null,
    siteSettings.telegram
      ? {
          href: siteSettings.telegram,
          label: 'Telegram',
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    label: string
    rel?: string
    target?: string
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
      <header className="cv-header">
        <p className="eyebrow">CV · Online resume</p>
        <h1 className="cv-title">
          {splitName(cv?.name).map((part, index) => (
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
              <a href={action.href} key={action.label} rel={action.rel} target={action.target}>
                {action.label} →
              </a>
            ))}
          </div>
        ) : null}
      </header>

      {summaryPairs.length > 0 ? (
        <section className="summary-grid" aria-labelledby="profile-title">
          <h2 className="section-title" id="profile-title">
            Profile
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
              Key expertise
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
              Experience
            </h2>
          </div>

          <div className="experience-list">
            {experienceItems.map((item) => {
              const dateRange = formatExperienceRange(item.startDate, item.endDate, item.current)

              return (
                <article className="experience-item" key={item.id}>
                  <div className="experience-meta">
                    {hasText(item.company) ? <p className="experience-company">{item.company}</p> : null}
                    {dateRange ? <p className="experience-period">{dateRange}</p> : null}
                    {hasText(item.location) ? <p>{item.location}</p> : null}
                  </div>

                  <div className="experience-body">
                    {hasText(item.role) ? <h3 className="experience-role">{item.role}</h3> : null}
                    {hasText(item.summary) ? <p>{item.summary}</p> : null}

                    {item.highlights?.some((highlight) => hasText(highlight.text)) ? (
                      <ul>
                        {item.highlights.map((highlight) =>
                          hasText(highlight.text) ? <li key={highlight.id}>{highlight.text}</li> : null,
                        )}
                      </ul>
                    ) : null}

                    {hasText(item.stack) ? <p className="stack">Stack: {item.stack}</p> : null}
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
              Technology
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
              Education
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
                    {hasText(item.institution) ? <p className="education-desc">{item.institution}</p> : null}
                    {hasText(item.description) ? <p className="education-desc">{item.description}</p> : null}
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
              Languages
            </h2>
          </div>

          <div className="languages">
            {languageItems.map((item) => (
              <span key={item.id}>
                {[item.language, item.level].filter(hasText).join(' · ')}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {contactItems.length > 0 ? (
        <section className="section" aria-labelledby="contact-title">
          <div className="section-header">
            <h2 className="section-title" id="contact-title">
              Contacts
            </h2>
          </div>

          <div className="contacts">
            {contactItems.map((item) =>
              item.href ? (
                <a href={item.href} key={item.label}>
                  {item.label} →
                </a>
              ) : null,
            )}
            {cv?.pdf?.url ? (
              <a href={cv.pdf.url} rel="noreferrer" target="_blank">
                Download PDF →
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {!hasStructuredContent ? (
        <section className="section">
          <p>Formal CV details will appear here once they are added in Payload.</p>
        </section>
      ) : null}
    </>
  )
}

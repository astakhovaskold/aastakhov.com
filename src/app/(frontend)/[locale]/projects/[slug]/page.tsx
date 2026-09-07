import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import {
  ProjectDetailContacts,
  ProjectDetailContent,
  ProjectDetailCover,
  ProjectDetailMeta,
  ProjectDetailRelatedPosts,
} from '@/components/site/project-detail-content'
import { routing } from '@/i18n/routing'
import { getProjectDetailBySlug } from '@/lib/project-detail'
import {
  createNotFoundMetadata,
  createSeoMetadata,
  isPubliclyIndexableEntity,
} from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'

type ProjectDetailPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const [{ project }, settings] = await Promise.all([
    getProjectDetailBySlug(slug, locale),
    getSiteSettings(locale),
  ])
  const canonicalPath = `/projects/${slug}`

  if (!project || !isPubliclyIndexableEntity(project)) {
    return createNotFoundMetadata({
      canonicalPath,
      locale: locale as 'ru' | 'en',
      resource: 'Project',
      settings,
    })
  }

  return createSeoMetadata({
    canonicalPath,
    entity: project,
    locale: locale as 'ru' | 'en',
    settings,
  })
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [{ project, relatedWriting, selectedCaseNotes }, settings, projectDetailT] =
    await Promise.all([
      getProjectDetailBySlug(slug, locale),
      getSiteSettings(locale),
      getTranslations('projectDetail'),
    ])

  if (!project || !isPubliclyIndexableEntity(project)) {
    notFound()
  }

  const contactLinks = [
    project.externalUrl ? { href: project.externalUrl, label: 'Project link' } : null,
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    { href: `mailto:${settings.email}`, label: 'Email' },
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
  ].filter((link): link is { href: string; label: string } => Boolean(link))
  const hasProjectBody = Boolean(project.coverImage || project.content?.root?.children?.length)

  return (
    <>
      <article className="project-detail">
        <header className="project-detail-header">
          {project.eyebrow ? <p className="eyebrow">{project.eyebrow}</p> : null}
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-subtitle">{project.description}</p>
          <ProjectDetailMeta project={project} />
        </header>

        {hasProjectBody ? (
          <>
            <ProjectDetailCover project={project} />
            <ProjectDetailContent project={project} />
          </>
        ) : null}
      </article>

      <ProjectDetailRelatedPosts posts={selectedCaseNotes} title={projectDetailT('relatedWriting')} />
      <ProjectDetailRelatedPosts posts={relatedWriting} title={projectDetailT('relatedWriting')} />
      <ProjectDetailContacts links={contactLinks} />
    </>
  )
}

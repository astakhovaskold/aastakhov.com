import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ProjectList } from '@/components/site/project-list'
import { SectionHeader } from '@/components/site/section-header'
import { routing } from '@/i18n/routing'
import { getPublishedProjects } from '@/lib/projects'
import { createSeoMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'
import type { Media, Project } from '@/payload-types'

type ProjectSummary = Pick<
  Project,
  'id' | 'title' | 'slug' | 'description' | 'type' | 'status' | 'year' | 'startedAt' | 'updatedAt'
> & {
  previewImage?: Media | null
}

type ProjectsPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'projects' }),
  ])

  return createSeoMetadata({
    canonicalPath: '/projects',
    description: t('description'),
    locale: locale as 'ru' | 'en',
    settings,
    title: t('title'),
  })
}

function isMedia(value: Project['previewImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatProjectYear(project: Pick<Project, 'year' | 'startedAt' | 'updatedAt'>): string | null {
  if (typeof project.year === 'number') {
    return String(project.year)
  }

  const source = project.startedAt || project.updatedAt
  const date = new Date(source)

  if (Number.isNaN(date.valueOf())) {
    return null
  }

  return String(date.getUTCFullYear())
}

function formatProjectMeta(
  project: ProjectSummary,
  statusValues: (key: string) => string,
): string {
  const parts: string[] = [project.type]

  parts.push(statusValues(project.status))

  const year = formatProjectYear(project)

  if (year) {
    parts.push(year)
  }

  return parts.join(' / ')
}

function formatProjectTitle(project: ProjectSummary, t: (key: string) => string): string {
  if (project.status === 'archived') {
    return `${project.title} (${t('statusValues.archived')})`
  }

  if (project.status === 'future') {
    return `${project.title} (${t('statusValues.future')})`
  }

  return project.title
}

async function getProjects(locale: string): Promise<ProjectSummary[]> {
  const projects = await getPublishedProjects(locale, {
    depth: 1,
    sort: ['order', '-year', '-startedAt', '-updatedAt'],
  })

  return projects.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      type: project.type,
      status: project.status,
      year: project.year,
      startedAt: project.startedAt,
      updatedAt: project.updatedAt,
      previewImage: isMedia(project.previewImage) ? project.previewImage : null,
  }))
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [projects, settings, t, projectT, common] = await Promise.all([
    getProjects(locale),
    getSiteSettings(locale),
    getTranslations('projects'),
    getTranslations('project'),
    getTranslations('common'),
  ])
  const statusValues = (key: string) =>
    (projectT as unknown as (key: string) => string)(`statusValues.${key}`)
  const projectTAny = projectT as unknown as (key: string) => string

  return (
    <>
      <section className="hero">
        {settings.projectsEyebrow ? <p className="eyebrow">{settings.projectsEyebrow}</p> : null}
        <h1>{t('title')}</h1>
        <p className="lede">{t('description')}</p>
      </section>

      <section className="section" id="projects-list">
        <SectionHeader
          action={<span className="section-link">{projectT('archivedAndFuture')}</span>}
          title={t('title')}
        />

        {projects.length > 0 ? (
          <ProjectList
            getMeta={(project) => formatProjectMeta(project, statusValues)}
            getTitle={(project) => formatProjectTitle(project, projectTAny)}
            items={projects}
          />
        ) : (
          <p>{common('noProjectsPublished')}</p>
        )}
      </section>
    </>
  )
}

import config from '@payload-config'
import { getPayload } from 'payload'

import { ProjectList } from '@/components/site/project-list'
import { SectionHeader } from '@/components/site/section-header'
import { getSiteSettings } from '@/lib/siteSettings'
import type { Media, Project } from '@/payload-types'

type ProjectSummary = Pick<
  Project,
  'id' | 'title' | 'slug' | 'description' | 'type' | 'status' | 'year' | 'startedAt' | 'updatedAt'
> & {
  previewImage?: Media | null
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

function formatProjectMeta(project: ProjectSummary): string {
  const parts: string[] = [project.type]

  if (project.status === 'archived') {
    parts.push('archived')
  } else if (project.status === 'future') {
    parts.push('future')
  } else {
    parts.push(project.status)
  }

  const year = formatProjectYear(project)

  if (year) {
    parts.push(year)
  }

  return parts.join(' / ')
}

function formatProjectTitle(project: ProjectSummary): string {
  if (project.status === 'archived') {
    return `${project.title} (archived)`
  }

  if (project.status === 'future') {
    return `${project.title} (future)`
  }

  return project.title
}

async function getProjects(): Promise<ProjectSummary[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  try {
    const payload = await getPayload({ config })
    const projects = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      sort: ['order', '-year', '-startedAt', '-updatedAt'],
    })

    return projects.docs.map((project) => ({
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
  } catch {
    return []
  }
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])

  return (
    <>
      <section className="hero">
        {settings.projectsEyebrow ? <p className="eyebrow">{settings.projectsEyebrow}</p> : null}
        <h1>Projects</h1>
        <p className="lede">
          Products, companies, websites, concepts, experiments, and future initiatives. This is
          an index of projects, not a client portfolio.
        </p>
      </section>

      <section className="section" id="projects-list">
        <SectionHeader action={<span className="section-link">Archived and future items stay in the list.</span>} title="All projects" />

        {projects.length > 0 ? (
          <ProjectList
            getMeta={formatProjectMeta}
            getTitle={formatProjectTitle}
            items={projects}
          />
        ) : (
          <p>No projects published yet.</p>
        )}
      </section>
    </>
  )
}

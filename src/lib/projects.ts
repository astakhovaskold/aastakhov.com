import config from '@payload-config'
import { getPayload } from 'payload'

import type { Project } from '@/payload-types'

type ProjectPublicationFields = Pick<Project, 'published'> & {
  /** Supports projects created before the explicit publication field existed. */
  _status?: 'draft' | 'published' | null
  publishedAt?: null | string
}

export type PublicProject = Project & ProjectPublicationFields

export function isProjectPublic(
  project: ProjectPublicationFields,
  now: Date = new Date(),
): boolean {
  if (project.published === false) {
    return false
  }

  if (project._status !== undefined && project._status !== null) {
    return project._status === 'published'
  }

  if (project.publishedAt !== undefined) {
    if (!project.publishedAt) {
      return false
    }

    const publishedAt = new Date(project.publishedAt)

    return !Number.isNaN(publishedAt.valueOf()) && publishedAt <= now
  }

  // Existing Projects records predate the publication field and were public by
  // definition. Treating an absent value as published preserves those records.
  return true
}

export async function getPublishedProjects(options?: {
  depth?: number
  limit?: number
  sort?: string | string[]
}): Promise<PublicProject[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  try {
    const payload = await getPayload({ config })
    const projects = await payload.find({
      collection: 'projects',
      depth: options?.depth ?? 0,
      limit: 0,
      pagination: false,
      sort: options?.sort ?? ['order', '-year', '-startedAt', '-updatedAt'],
    })

    const publishedProjects = projects.docs.filter((project) => isProjectPublic(project))

    return typeof options?.limit === 'number'
      ? publishedProjects.slice(0, options.limit)
      : publishedProjects
  } catch {
    return []
  }
}

import config from '@payload-config'
import { getPayload } from 'payload'

import { isProjectPubliclyVisible } from '@/lib/projects'
import type { Post, Project } from '@/payload-types'

type ProjectDetailData = {
  project: Project | null
  relatedWriting: Post[]
}

function populatedPosts(value: Array<number | Post> | null | undefined): Post[] {
  return value?.filter((post): post is Post => typeof post === 'object') ?? []
}

export async function getProjectDetailBySlug(
  slug: string,
  locale: string,
): Promise<ProjectDetailData> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      project: null,
      relatedWriting: [],
    }
  }

  try {
    const payload = await getPayload({ config })
    const projects = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 1,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    const project = projects.docs.find((entry) => isProjectPubliclyVisible(entry)) ?? null

    if (!project) {
      return {
        project: null,
        relatedWriting: [],
      }
    }

    return {
      project,
      relatedWriting: populatedPosts(project.relatedWriting),
    }
  } catch {
    return {
      project: null,
      relatedWriting: [],
    }
  }
}

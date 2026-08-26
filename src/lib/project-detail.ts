import config from '@payload-config'
import { getPayload } from 'payload'

import { isProjectPublic } from '@/lib/projects'
import type { Post, Project } from '@/payload-types'

type ProjectDetailData = {
  project: Project | null
  relatedWriting: Post[]
  selectedCaseNotes: Post[]
}

function populatedPosts(value: Array<number | Post> | null | undefined): Post[] {
  return value?.filter((post): post is Post => typeof post === 'object') ?? []
}

export async function getProjectDetailBySlug(slug: string): Promise<ProjectDetailData> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      project: null,
      relatedWriting: [],
      selectedCaseNotes: [],
    }
  }

  try {
    const payload = await getPayload({ config })
    const projects = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    const project = projects.docs.find((entry) => isProjectPublic(entry)) ?? null

    if (!project) {
      return {
        project: null,
        relatedWriting: [],
        selectedCaseNotes: [],
      }
    }

    return {
      project,
      relatedWriting: populatedPosts(project.relatedWriting),
      selectedCaseNotes: populatedPosts(project.selectedCaseNotes),
    }
  } catch {
    return {
      project: null,
      relatedWriting: [],
      selectedCaseNotes: [],
    }
  }
}

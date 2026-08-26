import config from '@payload-config'
import { getPayload } from 'payload'

import type { Post, Project } from '@/payload-types'

type ProjectDetailData = {
  project: Project | null
  relatedPosts: Post[]
}

function hasProjectRelation(value: number | Project, projectId: number): boolean {
  if (typeof value === 'number') {
    return value === projectId
  }

  return value.id === projectId
}

function fallbackRelatedPostSlugs(project: Project): string[] {
  return project.relatedPosts?.map((entry) => entry.slug).filter(Boolean) ?? []
}

async function findRelatedPosts(project: Project): Promise<Post[]> {
  const payload = await getPayload({ config })
  const primary = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
    where: {
      relatedProjects: {
        exists: true,
      },
    },
  })

  const directMatches = primary.docs.filter((post) =>
    post.relatedProjects?.some((entry) => hasProjectRelation(entry, project.id)),
  )

  if (directMatches.length > 0) {
    return directMatches
  }

  const slugs = fallbackRelatedPostSlugs(project)

  if (slugs.length === 0) {
    return []
  }

  const fallback = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: slugs.length,
    sort: '-publishedAt',
    where: {
      slug: {
        in: slugs,
      },
    },
  })

  const docsBySlug = new Map(fallback.docs.map((post) => [post.slug, post]))

  return slugs.map((slug) => docsBySlug.get(slug)).filter((post): post is Post => Boolean(post))
}

export async function getProjectDetailBySlug(slug: string): Promise<ProjectDetailData> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      project: null,
      relatedPosts: [],
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

    const project = projects.docs[0] ?? null

    if (!project) {
      return {
        project: null,
        relatedPosts: [],
      }
    }

    let relatedPosts: Post[] = []

    try {
      relatedPosts = await findRelatedPosts(project)
    } catch {
      relatedPosts = []
    }

    return {
      project,
      relatedPosts,
    }
  } catch {
    return {
      project: null,
      relatedPosts: [],
    }
  }
}

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'

type PostDetailData = {
  nextPost: Post | null
  post: Post | null
  previousPost: Post | null
}

const emptyPostDetailData: PostDetailData = {
  nextPost: null,
  post: null,
  previousPost: null,
}

async function findAdjacentPosts(post: Post): Promise<Pick<PostDetailData, 'nextPost' | 'previousPost'>> {
  if (!post.publishedAt) {
    return {
      nextPost: null,
      previousPost: null,
    }
  }

  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 100,
    sort: '-publishedAt',
    where: {
      and: [
        {
          publishedAt: {
            exists: true,
          },
        },
        {
          publishedAt: {
            less_than_equal: new Date().toISOString(),
          },
        },
      ],
    },
  })

  const index = posts.docs.findIndex((entry) => entry.id === post.id)

  if (index === -1) {
    return {
      nextPost: null,
      previousPost: null,
    }
  }

  return {
    previousPost: posts.docs[index - 1] ?? null,
    nextPost: posts.docs[index + 1] ?? null,
  }
}

export async function getPostDetailBySlug(slug: string): Promise<PostDetailData> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return emptyPostDetailData
  }

  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 1,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            publishedAt: {
              exists: true,
            },
          },
          {
            publishedAt: {
              less_than_equal: new Date().toISOString(),
            },
          },
        ],
      },
    })

    const post = posts.docs[0] ?? null

    if (!post) {
      return emptyPostDetailData
    }

    try {
      const adjacentPosts = await findAdjacentPosts(post)

      return {
        post,
        ...adjacentPosts,
      }
    } catch {
      return {
        nextPost: null,
        post,
        previousPost: null,
      }
    }
  } catch {
    return emptyPostDetailData
  }
}

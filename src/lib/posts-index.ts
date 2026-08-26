import config from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Post, PostCategory } from '@/payload-types'

export type PostCategoryLink = {
  description?: null | string
  href: string
  id: number
  label: string
  singularLabel: string
  slug: string
}

export type PostListItem = Pick<
  Post,
  'id' | 'title' | 'slug' | 'description' | 'publishedAt' | 'readingTime' | 'language'
> & {
  postCategory: PostCategory | null
  previewImage: Media | null
}

export type PostsIndexPageData = {
  categoryLinks: PostCategoryLink[]
  posts: PostListItem[]
}

function isMedia(value: Post['previewImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function isPostCategory(
  value: null | number | Post['postCategory'] | undefined,
): value is PostCategory {
  return typeof value === 'object' && value !== null && 'slug' in value
}

function mapCategoryLink(category: PostCategory): PostCategoryLink {
  return {
    description: category.description,
    href: `/posts/category/${category.slug}`,
    id: category.id,
    label: category.title,
    singularLabel: category.singularLabel,
    slug: category.slug,
  }
}

export function getPostCategoryBySlug(
  categories: PostCategoryLink[],
  slug: string,
): PostCategoryLink | null {
  return categories.find((category) => category.slug === slug) ?? null
}

export function getPostCategoryLabel(category: null | Post['postCategory']): string {
  if (!isPostCategory(category)) {
    return ''
  }

  return category.singularLabel || category.title
}

export function formatPostDate(value: string | null | undefined): string | null {
  if (!value) {
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

export function formatPostMeta(post: {
  language: string
  postCategory: null | Post['postCategory'] | undefined
  publishedAt?: null | string
  readingTime?: null | number
}): string {
  const parts = [getPostCategoryLabel(post.postCategory || null)]
  const date = formatPostDate(post.publishedAt)

  if (date) {
    parts.push(date)
  }

  if (post.readingTime) {
    parts.push(`${post.readingTime} min read`)
  }

  parts.push(post.language.toUpperCase())

  return parts.filter(Boolean).join(' / ')
}

export async function getPostCategoryLinks(options?: {
  includeHidden?: boolean
}): Promise<PostCategoryLink[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  try {
    const payload = await getPayload({ config })
    const categories = await payload.find({
      collection: 'post-categories',
      depth: 0,
      limit: 100,
      sort: ['order', 'title'],
      ...(options?.includeHidden
        ? {}
        : {
            where: {
              showInPostsNavigation: {
                equals: true,
              },
            },
          }),
    })

    return categories.docs.map(mapCategoryLink)
  } catch {
    return []
  }
}

export async function getPublishedPosts(postCategoryId?: number): Promise<PostListItem[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
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
          ...(postCategoryId
            ? [
                {
                  postCategory: {
                    equals: postCategoryId,
                  },
                },
              ]
            : []),
        ],
      },
    })

    return posts.docs.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      postCategory: isPostCategory(post.postCategory) ? post.postCategory : null,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      language: post.language,
      previewImage: isMedia(post.previewImage) ? post.previewImage : null,
    }))
  } catch {
    return []
  }
}

export async function getPostsIndexPageData(postCategoryId?: number): Promise<PostsIndexPageData> {
  const [categoryLinks, posts] = await Promise.all([
    getPostCategoryLinks(),
    getPublishedPosts(postCategoryId),
  ])

  return {
    categoryLinks,
    posts,
  }
}

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Post, PostCategory } from '@/payload-types'

export type PostCategoryLink = {
  description?: null | string
  eyebrow?: null | string
  href: string
  id: number
  label: string
  singularLabel: string
  slug: string
}

export type PostListItem = Pick<
  Post,
  'id' | 'title' | 'slug' | 'description' | 'publishedAt' | 'readingTime'
> & {
  postCategory: PostCategory | null
  previewImage: Media | null
  coverImage: Media | null
}

export type PostsIndexPageData = {
  categoryLinks: PostCategoryLink[]
  posts: PostListItem[]
  featuredPost: PostListItem | null
}

function isMedia(value: Post['coverImage'] | Post['previewImage']): value is Media {
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
    eyebrow: category.eyebrow,
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

export function getPostCardMeta(post: {
  postCategory: null | Post['postCategory'] | undefined
  publishedAt?: null | string
}): { category: string; date: string | null } {
  return {
    category: getPostCategoryLabel(post.postCategory || null),
    date: formatPostDate(post.publishedAt),
  }
}

export async function getPostCategoryLinks(
  locale: string,
  options?: {
    includeHidden?: boolean
  },
): Promise<PostCategoryLink[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  try {
    const payload = await getPayload({ config })
    const categories = await payload.find({
      collection: 'post-categories',
      depth: 0,
      limit: 100,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
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

export async function getPostCategoryIdsWithPosts(locale: string): Promise<Set<number>> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Set()
  }

  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
      select: {
        postCategory: true,
      },
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

    return new Set(
      posts.docs
        .map((post) => (typeof post.postCategory === 'number' ? post.postCategory : null))
        .filter((id): id is number => id !== null),
    )
  } catch {
    return new Set()
  }
}

export async function getPostCategoryLinksWithPosts(locale: string): Promise<PostCategoryLink[]> {
  const [categoryLinks, categoryIdsWithPosts] = await Promise.all([
    getPostCategoryLinks(locale),
    getPostCategoryIdsWithPosts(locale),
  ])

  return categoryLinks.filter((category) => categoryIdsWithPosts.has(category.id))
}

export async function getPublishedPosts(
  locale: string,
  postCategoryId?: number,
): Promise<PostListItem[]> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
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
      previewImage: isMedia(post.previewImage) ? post.previewImage : null,
      coverImage: isMedia(post.coverImage) ? post.coverImage : null,
    }))
  } catch {
    return []
  }
}

export async function getFeaturedPost(locale: string): Promise<PostListItem | null> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }

  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 1,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
      sort: '-publishedAt',
      where: {
        and: [
          {
            featured: {
              equals: true,
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

    const post = posts.docs[0]

    if (!post) {
      return null
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      postCategory: isPostCategory(post.postCategory) ? post.postCategory : null,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      previewImage: isMedia(post.previewImage) ? post.previewImage : null,
      coverImage: isMedia(post.coverImage) ? post.coverImage : null,
    }
  } catch {
    return null
  }
}

export async function getPostsIndexPageData(
  locale: string,
  postCategoryId?: number,
): Promise<PostsIndexPageData> {
  const [categoryLinks, posts, featuredPost] = await Promise.all([
    getPostCategoryLinksWithPosts(locale),
    getPublishedPosts(locale, postCategoryId),
    postCategoryId ? Promise.resolve(null) : getFeaturedPost(locale),
  ])

  return {
    categoryLinks,
    posts,
    featuredPost,
  }
}

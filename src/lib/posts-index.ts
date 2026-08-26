import config from '@payload-config'
import { getPayload } from 'payload'

import type { Media, Post } from '@/payload-types'

export const postCategoryLinks = [
  { href: '/posts', label: 'All', slug: null, value: null },
  { href: '/posts/category/cases', label: 'Case notes', slug: 'cases', value: 'case' },
  { href: '/posts/category/articles', label: 'Articles', slug: 'articles', value: 'article' },
  { href: '/posts/category/notes', label: 'Notes', slug: 'notes', value: 'note' },
  { href: '/posts/category/guides', label: 'Guides', slug: 'guides', value: 'guide' },
  { href: '/posts/category/essays', label: 'Essays', slug: 'essays', value: 'essay' },
] as const

type PostCategoryLink = (typeof postCategoryLinks)[number]

export type PostCategorySlug = Exclude<PostCategoryLink['slug'], null>
export type PostCategoryValue = Exclude<PostCategoryLink['value'], null>

export type PostListItem = Pick<
  Post,
  'id' | 'title' | 'slug' | 'description' | 'publishedAt' | 'readingTime' | 'language'
> & {
  category: PostCategoryValue
  previewImage: Media | null
}

function isMedia(value: Post['previewImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function getPostCategoryBySlug(slug: string): PostCategoryLink | null {
  return postCategoryLinks.find((category) => category.slug === slug) ?? null
}

export function getPostCategoryLabel(category: PostCategoryValue): string {
  switch (category) {
    case 'article':
      return 'Article'
    case 'case':
      return 'Case note'
    case 'note':
      return 'Note'
    case 'guide':
      return 'Guide'
    case 'essay':
      return 'Essay'
  }
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

export function formatPostMeta(post: Pick<PostListItem, 'category' | 'publishedAt' | 'readingTime' | 'language'>): string {
  const parts = [getPostCategoryLabel(post.category)]
  const date = formatPostDate(post.publishedAt)

  if (date) {
    parts.push(date)
  }

  if (post.readingTime) {
    parts.push(`${post.readingTime} min read`)
  }

  parts.push(post.language.toUpperCase())

  return parts.join(' / ')
}

export async function getPublishedPosts(category?: PostCategoryValue): Promise<PostListItem[]> {
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
          ...(category
            ? [
                {
                  category: {
                    equals: category,
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
      category: post.category,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      language: post.language,
      previewImage: isMedia(post.previewImage) ? post.previewImage : null,
    }))
  } catch {
    return []
  }
}

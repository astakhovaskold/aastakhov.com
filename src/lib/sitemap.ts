import { getPublishedProjects } from '@/lib/projects'
import { getPostCategoryLinks, getPublishedPosts } from '@/lib/posts-index'

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_SERVER_URL?.trim()

  if (!configuredUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be configured for sitemap and robots URLs.')
  }

  return configuredUrl.replace(/\/+$/, '')
}

export function buildSitemapUrl(path: string): string {
  return `${getSiteUrl()}${path}`
}

export function buildPublicSitemapPaths(input: {
  categories: Array<{ slug: string }>
  posts: Array<{ slug: string }>
  projects: Array<{ slug: string }>
}): string[] {
  return [
    '/',
    '/projects',
    ...input.projects.map((project) => `/projects/${project.slug}`),
    '/posts',
    ...input.categories.map((category) => `/posts/category/${category.slug}`),
    ...input.posts.map((post) => `/posts/${post.slug}`),
    '/cv',
  ]
}

export async function getPublicSitemapPaths(): Promise<string[]> {
  const [projects, categories, posts] = await Promise.all([
    getPublishedProjects({ depth: 0 }),
    getPostCategoryLinks({ includeHidden: true }),
    getPublishedPosts(),
  ])

  return buildPublicSitemapPaths({ categories, posts, projects })
}

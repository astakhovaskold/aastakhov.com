import { getSiteUrl as getCanonicalSiteUrl } from '@/lib/seo'
import { getPublishedProjects } from '@/lib/projects'
import { getPostCategoryLinks, getPublishedPosts } from '@/lib/posts-index'

export function getSiteUrl(): string {
  return getCanonicalSiteUrl().toString().replace(/\/+$/, '')
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
    getPublishedProjects('ru', { depth: 0 }),
    getPostCategoryLinks('ru', { includeHidden: true }),
    getPublishedPosts('ru'),
  ])

  return buildPublicSitemapPaths({ categories, posts, projects })
}

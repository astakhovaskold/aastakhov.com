import { getSiteUrl as getCanonicalSiteUrl } from '@/lib/seo'
import { getPublishedProjects } from '@/lib/projects'
import { getPostCategoryLinks, getPublishedPosts } from '@/lib/posts-index'
import { getPostLastModifiedDate } from '@/lib/post-dates'

export type SitemapEntry = {
  path: string
  lastModified?: Date
}

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

export function buildPublicSitemapEntries(input: {
  categories: Array<{ slug: string }>
  posts: Array<{ slug: string; lastModified?: Date }>
  projects: Array<{ slug: string }>
}): SitemapEntry[] {
  return [
    { path: '/' },
    { path: '/projects' },
    ...input.projects.map((project) => ({ path: `/projects/${project.slug}` })),
    { path: '/posts' },
    ...input.categories.map((category) => ({ path: `/posts/category/${category.slug}` })),
    ...input.posts.map((post) => ({ path: `/posts/${post.slug}`, lastModified: post.lastModified })),
    { path: '/cv' },
  ]
}

export async function getPublicSitemapEntries(): Promise<SitemapEntry[]> {
  const [projects, categories, posts] = await Promise.all([
    getPublishedProjects('ru', { depth: 0 }),
    getPostCategoryLinks('ru', { includeHidden: true }),
    getPublishedPosts('ru'),
  ])

  return buildPublicSitemapEntries({
    categories,
    posts: posts.map((post) => ({
      slug: post.slug,
      lastModified: getPostLastModifiedDate(post),
    })),
    projects,
  })
}

export async function getPublicSitemapPaths(): Promise<string[]> {
  const entries = await getPublicSitemapEntries()
  return entries.map((entry) => entry.path)
}

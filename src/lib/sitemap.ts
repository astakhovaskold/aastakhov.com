import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { getPostLastModifiedDate } from '@/lib/post-dates'
import { getPostCategoryLinks, getPublishedPosts } from '@/lib/posts-index'
import { isProjectPubliclyVisible, getPublishedProjects } from '@/lib/projects'
import { getSiteUrl as getCanonicalSiteUrl, pageUrl } from '@/lib/seo'
import { getTopicsWithPosts } from '@/lib/topics'

export type SitemapEntry = {
  path: string
  lastModified?: Date
}

export type LocaleSitemapData = {
  posts: Array<{ slug: string; lastModified?: Date }>
  projects: Array<{ slug: string; lastModified?: Date }>
  categories: Array<{ slug: string; count: number }>
  topics?: Array<{ slug: string }>
}

export type MultiLocaleSitemapInput = {
  ru: LocaleSitemapData
  en: LocaleSitemapData
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

export function buildLocalizedSitemapEntries(input: MultiLocaleSitemapInput): MetadataRoute.Sitemap {
  const locales = ['ru', 'en'] as const
  const localeMap = new Map<'ru' | 'en', Map<string, Date | undefined>>()

  for (const locale of locales) {
    const paths = new Map<string, Date | undefined>()
    const data = input[locale]

    // 1. Home
    paths.set('/', undefined)

    // 2. CV
    paths.set('/cv', undefined)

    // 3. Projects index (only if projects exist in this locale)
    if (data.projects.length > 0) {
      paths.set('/projects', undefined)
    }

    // 4. Posts index (only if posts exist in this locale)
    if (data.posts.length > 0) {
      paths.set('/posts', undefined)
    }

    // 5. Category pages (only if category count > 0 in this locale)
    for (const cat of data.categories) {
      if (cat.count > 0) {
        paths.set(`/posts/category/${cat.slug}`, undefined)
      }
    }

    // 5b. Topic hubs (the caller passes only topics that have public posts)
    for (const topic of data.topics ?? []) {
      paths.set(`/topics/${topic.slug}`, undefined)
    }

    // 6. Projects detail
    for (const project of data.projects) {
      paths.set(`/projects/${project.slug}`, project.lastModified)
    }

    // 7. Posts detail
    for (const post of data.posts) {
      paths.set(`/posts/${post.slug}`, post.lastModified)
    }

    localeMap.set(locale, paths)
  }

  // Collect all unique paths preserving logical order
  const allPaths: string[] = []
  const seenPaths = new Set<string>()
  for (const locale of locales) {
    for (const path of localeMap.get(locale)!.keys()) {
      if (!seenPaths.has(path)) {
        seenPaths.add(path)
        allPaths.push(path)
      }
    }
  }

  const sitemap: MetadataRoute.Sitemap = []

  for (const path of allPaths) {
    const existingLocales = locales.filter((loc) => localeMap.get(loc)!.has(path))
    if (existingLocales.length === 0) continue

    const languages: Record<string, string> = {}
    for (const loc of existingLocales) {
      languages[loc] = pageUrl(loc, path)
    }
    const defaultLocale = existingLocales.includes('en') ? 'en' : existingLocales[0]
    languages['x-default'] = pageUrl(defaultLocale, path)

    for (const loc of existingLocales) {
      const lastModified = localeMap.get(loc)!.get(path)
      sitemap.push({
        url: pageUrl(loc, path),
        ...(lastModified ? { lastModified } : {}),
        alternates: {
          languages,
        },
      })
    }
  }

  return sitemap
}

export async function getPublicSitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return []
  }

  const payload = await getPayload({ config })

  const fetchLocaleData = async (locale: 'ru' | 'en'): Promise<LocaleSitemapData> => {
    const [projectsRes, postsRes, categoriesRes] = await Promise.all([
      payload.find({
        collection: 'projects',
        depth: 0,
        limit: 100,
        locale,
        fallbackLocale: false,
        pagination: false,
      }),
      payload.find({
        collection: 'posts',
        depth: 0,
        limit: 1000,
        locale,
        fallbackLocale: false,
        pagination: false,
        where: {
          and: [
            { publishedAt: { exists: true } },
            { publishedAt: { less_than_equal: new Date().toISOString() } },
          ],
        },
      }),
      payload.find({
        collection: 'post-categories',
        depth: 0,
        limit: 100,
        locale,
        fallbackLocale: false,
        pagination: false,
      }),
    ])

    const publicProjects = projectsRes.docs
      .filter((p) => isProjectPubliclyVisible(p) && Boolean(p.title || p.description))
      .map((p) => ({
        slug: p.slug,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      }))

    const publicPosts = postsRes.docs
      .filter((p) => Boolean(p.title || p.description))
      .map((p) => ({
        slug: p.slug,
        categoryId:
          typeof p.postCategory === 'object' && p.postCategory !== null
            ? (p.postCategory as { id: number }).id
            : typeof p.postCategory === 'number'
              ? p.postCategory
              : null,
        lastModified: getPostLastModifiedDate(p),
      }))

    const categories = categoriesRes.docs
      .filter((c) => Boolean(c.title))
      .map((c) => ({
        slug: c.slug,
        count: publicPosts.filter((p) => p.categoryId === c.id).length,
      }))

    const topics = (await getTopicsWithPosts(locale, { fallbackLocale: false })).map((topic) => ({
      slug: topic.slug,
    }))

    return {
      posts: publicPosts.map((p) => ({ slug: p.slug, lastModified: p.lastModified })),
      projects: publicProjects,
      categories,
      topics,
    }
  }

  const [ruData, enData] = await Promise.all([
    fetchLocaleData('ru'),
    fetchLocaleData('en'),
  ])

  return buildLocalizedSitemapEntries({ ru: ruData, en: enData })
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

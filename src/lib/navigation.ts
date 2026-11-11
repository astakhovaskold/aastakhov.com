import config from '@payload-config'
import { getPayload } from 'payload'

import { isProjectPubliclyVisible } from '@/lib/projects'

export type NavKey = 'cv' | 'posts' | 'projects'

export type NavItem = {
  href: string
  key: NavKey
}

export type NavigationCounts = {
  posts: number
  projects: number
}

/** Navigation entries for the sections that have public items. The CV is always linked. */
export function buildNavItems(counts: NavigationCounts): NavItem[] {
  const items: NavItem[] = []

  if (counts.projects > 0) items.push({ href: '/projects', key: 'projects' })
  if (counts.posts > 0) items.push({ href: '/posts', key: 'posts' })
  items.push({ href: '/cv', key: 'cv' })

  return items
}

/** Counts of public posts and projects for one locale, used to decide which sections to link. */
export async function getNavigationCounts(locale: string): Promise<NavigationCounts> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { posts: 0, projects: 0 }
  }

  try {
    const payload = await getPayload({ config })
    const [posts, projects] = await Promise.all([
      payload.count({
        collection: 'posts',
        locale: locale as 'en' | 'ru',
        where: {
          and: [
            { publishedAt: { exists: true } },
            { publishedAt: { less_than_equal: new Date().toISOString() } },
          ],
        },
      }),
      payload.find({
        collection: 'projects',
        depth: 0,
        limit: 0,
        locale: locale as 'en' | 'ru',
        fallbackLocale: 'ru',
        pagination: false,
      }),
    ])

    return {
      posts: posts.totalDocs,
      projects: projects.docs.filter((project) => isProjectPubliclyVisible(project)).length,
    }
  } catch {
    return { posts: 1, projects: 0 }
  }
}

import { revalidatePath, revalidateTag } from 'next/cache'

export type ContentKind = 'category' | 'cv' | 'post' | 'project' | 'settings' | 'topic'

export type RevalidationTargets = {
  paths: string[]
  /** Paths revalidated as a whole layout, so navigation and shared chrome refresh too. */
  layoutPaths: string[]
  tags: string[]
}

const LOCALES = ['ru', 'en'] as const

export const SITEMAP_TAG = 'sitemap'

function localized(path: string): string[] {
  return LOCALES.map((locale) => (path ? `/${locale}/${path}` : `/${locale}`))
}

/** Public pages and cache tags that depend on one kind of content. Pure, so it is easy to test. */
export function getRevalidationTargets(
  kind: ContentKind,
  slugs: Array<null | string | undefined> = [],
): RevalidationTargets {
  const uniqueSlugs = [...new Set(slugs.filter((slug): slug is string => Boolean(slug)))]
  const paths: string[] = []
  const layoutPaths: string[] = []

  switch (kind) {
    case 'post':
      paths.push(...localized(''), ...localized('posts'), ...localized('cv'))
      for (const slug of uniqueSlugs) paths.push(...localized(`posts/${slug}`))
      layoutPaths.push('/[locale]')
      break
    case 'project':
      paths.push(...localized(''), ...localized('projects'))
      for (const slug of uniqueSlugs) paths.push(...localized(`projects/${slug}`))
      layoutPaths.push('/[locale]')
      break
    case 'category':
      paths.push(...localized('posts'))
      for (const slug of uniqueSlugs) paths.push(...localized(`posts/category/${slug}`))
      break
    case 'topic':
      paths.push(...localized(''), ...localized('posts'))
      for (const slug of uniqueSlugs) paths.push(...localized(`topics/${slug}`))
      break
    case 'cv':
      paths.push(...localized('cv'))
      break
    case 'settings':
      paths.push(...localized(''), ...localized('posts'), ...localized('projects'), ...localized('cv'))
      layoutPaths.push('/[locale]')
      break
  }

  return { layoutPaths, paths, tags: [SITEMAP_TAG] }
}

/**
 * Invalidates the targets. It is a no-op outside a Next.js request (seed scripts, the Payload CLI,
 * tests), where the cache API throws.
 */
export function applyRevalidation(targets: RevalidationTargets): void {
  try {
    for (const path of targets.paths) revalidatePath(path)
    for (const path of targets.layoutPaths) revalidatePath(path, 'layout')
    for (const tag of targets.tags) revalidateTag(tag, 'max')
    revalidatePath('/sitemap.xml')
  } catch {
    // Not running inside a Next.js request; nothing to invalidate.
  }
}

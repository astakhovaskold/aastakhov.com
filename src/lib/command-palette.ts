export type SearchApiResponse = {
  results?: {
    posts?: Array<{ title: string; description?: string; url: string }>
    projects?: Array<{ title: string; description?: string; url: string }>
    openSource?: Array<{ name: string; description?: string; url: string }>
    cv?: { role?: string; summary?: string; stack?: string }
  }
}

export type PaletteItem = {
  id: string
  title: string
  description: string
  href: string
  external: boolean
}

export type PaletteGroup = {
  key: 'articles' | 'projects' | 'openSource' | 'skills'
  items: PaletteItem[]
}

export type HotkeyEventLike = {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  altKey?: boolean
  target?: EventTarget | { tagName?: string; isContentEditable?: boolean } | null
}

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function isEditableTarget(target: HotkeyEventLike['target']): boolean {
  if (!target) return false
  const el = target as { tagName?: string; isContentEditable?: boolean }
  return Boolean(el.isContentEditable) || EDITABLE_TAGS.has(String(el.tagName).toUpperCase())
}

/** Cmd+K / Ctrl+K anywhere; `/` only when focus is not in an editable field. */
export function isPaletteHotkey(event: HotkeyEventLike): boolean {
  if (event.altKey) return false
  const key = event.key.toLowerCase()
  if (key === 'k' && (event.metaKey || event.ctrlKey)) return true
  return key === '/' && !event.metaKey && !event.ctrlKey && !isEditableTarget(event.target)
}

const clip = (value: string | undefined, max = 140) => {
  const text = (value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function buildPaletteGroups(
  response: SearchApiResponse,
  query: string,
  locale: string,
): PaletteGroup[] {
  const results = response.results ?? {}
  const groups: PaletteGroup[] = []

  const articles = (results.posts ?? []).map((post) => ({
    id: `post:${post.url}`,
    title: post.title,
    description: clip(post.description),
    href: post.url,
    external: false,
  }))
  if (articles.length) groups.push({ key: 'articles', items: articles })

  const projects = (results.projects ?? []).map((project) => ({
    id: `project:${project.url}`,
    title: project.title,
    description: clip(project.description),
    href: project.url,
    external: false,
  }))
  if (projects.length) groups.push({ key: 'projects', items: projects })

  const openSource = (results.openSource ?? [])
    .filter((repo) => repo.url)
    .map((repo) => ({
      id: `oss:${repo.url}`,
      title: repo.name,
      description: clip(repo.description),
      href: repo.url,
      external: /^https?:\/\//.test(repo.url),
    }))
  if (openSource.length) groups.push({ key: 'openSource', items: openSource })

  const needle = query.trim().toLowerCase()
  const cv = results.cv
  if (needle && cv) {
    const haystack = `${cv.role ?? ''} ${cv.summary ?? ''} ${cv.stack ?? ''}`.toLowerCase()
    if (haystack.includes(needle)) {
      groups.push({
        key: 'skills',
        items: [
          {
            id: 'cv',
            title: cv.role || 'CV',
            description: clip(cv.stack || cv.summary),
            href: `/${locale}/cv`,
            external: false,
          },
        ],
      })
    }
  }

  return groups
}

export function flattenGroups(groups: PaletteGroup[]): PaletteItem[] {
  return groups.flatMap((group) => group.items)
}

/** Wrap arrow-key movement inside [0, count). */
export function moveIndex(current: number, delta: 1 | -1, count: number): number {
  if (count <= 0) return -1
  if (current < 0) return delta === 1 ? 0 : count - 1
  return (current + delta + count) % count
}

export type LexicalNodeLike = {
  children?: LexicalNodeLike[]
  tag?: string
  text?: string
  type?: string
} & Record<string, unknown>

export type LexicalDocumentLike = {
  root?: { children?: LexicalNodeLike[] }
} | null | undefined

export type ExtractedHeading = {
  id: string
  level: 2 | 3
  text: string
}

export type HeadingEntry = ExtractedHeading & { node: LexicalNodeLike }

const TOC_TAGS = new Set(['h2', 'h3'])

export function slugifyHeading(text: string): string {
  const slug = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'section'
}

function nodeText(node: LexicalNodeLike): string {
  if (typeof node.text === 'string') return node.text
  return node.children?.map(nodeText).join('') ?? ''
}

function walk(nodes: LexicalNodeLike[] | undefined, visit: (node: LexicalNodeLike) => void): void {
  for (const node of nodes ?? []) {
    visit(node)
    walk(node.children, visit)
  }
}

/**
 * Collects h2 and h3 headings in document order with unique ids. A repeated heading gets a numeric
 * suffix (`architecture`, `architecture-1`). The renderer and the table of contents both use this,
 * so their anchors always match.
 */
export function collectHeadings(content: LexicalDocumentLike): HeadingEntry[] {
  const entries: HeadingEntry[] = []
  const used = new Map<string, number>()

  walk(content?.root?.children, (node) => {
    if (node.type !== 'heading' || !node.tag || !TOC_TAGS.has(node.tag)) return

    const text = nodeText(node).trim()
    if (!text) return

    const base = slugifyHeading(text)
    const count = used.get(base) ?? 0
    used.set(base, count + 1)

    entries.push({
      id: count === 0 ? base : `${base}-${count}`,
      level: node.tag === 'h3' ? 3 : 2,
      node,
      text,
    })
  })

  return entries
}

export function extractHeadingsFromLexical(content: LexicalDocumentLike): ExtractedHeading[] {
  return collectHeadings(content).map(({ id, level, text }) => ({ id, level, text }))
}

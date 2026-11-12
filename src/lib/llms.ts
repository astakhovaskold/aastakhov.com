export type MarkdownDocument = {
  title: string
  slug: string
  description: string
  publishedAt?: null | string
  canonicalUrl: string
  locale: string
  kind: 'post' | 'project'
  body: string
}

const q = (value: string) => JSON.stringify(value ?? '')

/** One document: YAML frontmatter, H1, description, body. */
export function buildMarkdownDocument(doc: MarkdownDocument): string {
  const lines = [
    '---',
    `title: ${q(doc.title)}`,
    `slug: ${q(doc.slug)}`,
    `locale: ${q(doc.locale)}`,
    `type: ${q(doc.kind)}`,
    ...(doc.publishedAt ? [`publishedAt: ${q(doc.publishedAt)}`] : []),
    `description: ${q(doc.description)}`,
    `canonicalUrl: ${q(doc.canonicalUrl)}`,
    '---',
    '',
    `# ${doc.title}`,
    '',
  ]
  if (doc.description) lines.push(`> ${doc.description.replace(/\s+/g, ' ').trim()}`, '')
  lines.push(doc.body.trim(), '')
  return lines.join('\n')
}

export type LlmsIndexInput = {
  name: string
  jobTitle: string
  summary: string
  siteUrl: string
  posts: Array<{ title: string; description: string; url: string; publishedAt?: null | string }>
  projects: Array<{ title: string; description: string; url: string }>
  locales: Array<{ locale: string; cvUrl: string; projectsUrl: string; postsUrl: string }>
  agentEndpoints: Array<{ label: string; url: string }>
}

const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim()
const entry = (title: string, url: string, description: string) =>
  `- [${oneLine(title)}](${url})${description ? `: ${oneLine(description)}` : ''}`

/** Curated index in the llms.txt format. Advisory; no claim about Google Search. */
export function buildLlmsTxt(input: LlmsIndexInput): string {
  const tagline = [input.jobTitle, input.summary]
    .map(oneLine)
    .filter(Boolean)
    .map((part) => part.replace(/\.$/, ''))
    .join('. ')
  const out = [`# ${input.name}`, '', ...(tagline ? [`> ${tagline}.`, ''] : [])]

  out.push('## Key pages', '')
  for (const l of input.locales) {
    out.push(
      entry(`CV (${l.locale})`, l.cvUrl, ''),
      entry(`Projects (${l.locale})`, l.projectsUrl, ''),
      entry(`Blog (${l.locale})`, l.postsUrl, ''),
    )
  }
  out.push('')

  if (input.posts.length) {
    out.push('## Articles', '')
    for (const post of input.posts) out.push(entry(post.title, post.url, post.description))
    out.push('')
  }

  if (input.projects.length) {
    out.push('## Projects', '')
    for (const project of input.projects) out.push(entry(project.title, project.url, project.description))
    out.push('')
  }

  out.push('## Agent endpoints', '')
  out.push(entry('Full content (Markdown)', `${input.siteUrl}/llms-full.txt`, 'all published articles'))
  for (const endpoint of input.agentEndpoints) out.push(entry(endpoint.label, endpoint.url, ''))
  out.push(
    '',
    '## Optional',
    '',
    `- Any article is available as Markdown by appending \`.md\` to its URL.`,
    `- [Sitemap](${input.siteUrl}/sitemap.xml)`,
    '',
  )

  return out.join('\n')
}

export function buildLlmsFullTxt(input: { name: string; documents: string[] }): string {
  const header = `# ${input.name} — full content\n\nAll published articles as Markdown, separated by horizontal rules.\n`
  return [header, ...input.documents].join('\n---\n\n')
}

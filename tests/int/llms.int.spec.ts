import { describe, expect, it } from 'vitest'

import {
  CONTENT_SIGNAL,
  SEARCH_AND_USER_AGENTS,
  TRAINING_CRAWLERS,
} from '@/lib/ai-policy'
import { buildLlmsFullTxt, buildLlmsTxt, buildMarkdownDocument } from '@/lib/llms'
import { buildRobotsTxt } from '@/lib/robots-txt'

const doc = {
  body: '## Heading\n\nText.',
  canonicalUrl: 'https://www.example.com/en/posts/a',
  description: 'A "quoted" description',
  kind: 'post' as const,
  locale: 'en',
  publishedAt: '2026-01-02T00:00:00.000Z',
  slug: 'a',
  title: 'Title: with colon',
}

describe('buildMarkdownDocument', () => {
  const md = buildMarkdownDocument(doc)

  it('starts with valid frontmatter', () => {
    expect(md.startsWith('---\n')).toBe(true)
    expect(md).toContain('title: "Title: with colon"')
    expect(md).toContain('description: "A \\"quoted\\" description"')
    expect(md).toContain('canonicalUrl: "https://www.example.com/en/posts/a"')
    expect(md.split('---')[1]).toContain('publishedAt: "2026-01-02T00:00:00.000Z"')
  })

  it('has H1, description quote and body', () => {
    expect(md).toContain('\n# Title: with colon\n')
    expect(md).toContain('> A "quoted" description')
    expect(md).toContain('## Heading')
  })

  it('omits publishedAt for projects', () => {
    expect(buildMarkdownDocument({ ...doc, kind: 'project', publishedAt: null })).not.toContain(
      'publishedAt',
    )
  })
})

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt({
    agentEndpoints: [{ label: 'MCP server', url: 'https://x.com/api/mcp' }],
    jobTitle: 'Frontend Architect',
    locales: [
      { cvUrl: 'https://x.com/ru/cv', locale: 'ru', postsUrl: 'https://x.com/ru/posts', projectsUrl: 'https://x.com/ru/projects' },
    ],
    name: 'Askold',
    posts: [{ description: 'About\nISR', title: 'ISR (ru)', url: 'https://x.com/ru/posts/isr' }],
    projects: [],
    siteUrl: 'https://x.com',
    summary: 'Builds web platforms.',
  })

  it('follows the llms.txt shape', () => {
    expect(txt.startsWith('# Askold\n\n> Frontend Architect. Builds web platforms.')).toBe(true)
    expect(txt).toContain('## Articles')
    expect(txt).toContain('- [ISR (ru)](https://x.com/ru/posts/isr): About ISR')
    expect(txt).toContain('## Agent endpoints')
  })

  it('uses only absolute links', () => {
    const links = [...txt.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1])
    expect(links.length).toBeGreaterThan(5)
    for (const link of links) expect(link).toMatch(/^https:\/\//)
  })

  it('skips empty sections', () => {
    expect(txt).not.toContain('## Projects')
  })
})

describe('buildLlmsFullTxt', () => {
  it('joins documents with rules', () => {
    const out = buildLlmsFullTxt({ documents: ['A', 'B'], name: 'N' })
    expect(out).toContain('# N — full content')
    expect(out.split('\n---\n').length).toBe(3)
  })
})

describe('robots.txt', () => {
  const txt = buildRobotsTxt('https://www.example.com/')
  const groups = txt.trim().split(/\n\n/)

  it('has exactly one wildcard group', () => {
    expect(txt.match(/^User-agent: \*$/gm)).toHaveLength(1)
  })

  it('repeats the content signal in every group', () => {
    const agentGroups = groups.filter((g) => g.startsWith('User-agent'))
    expect(agentGroups).toHaveLength(1 + SEARCH_AND_USER_AGENTS.length + TRAINING_CRAWLERS.length)
    for (const group of agentGroups) expect(group).toContain(`Content-Signal: ${CONTENT_SIGNAL}`)
  })

  it('blocks training crawlers and allows search agents', () => {
    for (const bot of TRAINING_CRAWLERS) {
      expect(txt).toContain(`User-agent: ${bot}\nContent-Signal: ${CONTENT_SIGNAL}\nDisallow: /`)
    }
    for (const bot of SEARCH_AND_USER_AGENTS) {
      const group = groups.find((g) => g.startsWith(`User-agent: ${bot}\n`))!
      expect(group).toContain('Allow: /')
      expect(group).not.toMatch(/^Disallow: \/$/m)
    }
  })

  it('keeps private paths closed and public agent API open', () => {
    expect(txt).toContain('Disallow: /admin')
    expect(txt).toContain('Allow: /api/mcp')
  })

  it('names the sitemap on the canonical host', () => {
    expect(txt.trim().endsWith('Sitemap: https://www.example.com/sitemap.xml')).toBe(true)
  })
})

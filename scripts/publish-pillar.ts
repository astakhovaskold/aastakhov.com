import 'dotenv/config'

import { readFileSync } from 'node:fs'

import { getPayload } from 'payload'

import config from '../src/payload.config.js'

/**
 * One-off: publish the "frontend technical audit" pillar post from docs/drafts/*.md and make it
 * the pillar of the `quality-and-audits` topic. Idempotent by slug. Needs DATABASE_URL in the shell.
 */

type Node = Record<string, unknown>
type Draft = { body: string; meta: Record<string, string> }

function readDraft(path: string): Draft {
  const raw = readFileSync(path, 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error(`no front matter: ${path}`)
  const meta: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { body: match[2].trim(), meta }
}

const text = (value: string, format = 0): Node => ({
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
  type: 'text',
  version: 1,
})

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  children,
  direction: null,
  format: '',
  indent: 0,
  type,
  version: 1,
  ...extra,
})

function inline(value: string): Node[] {
  const out: Node[] = []
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  for (const m of value.matchAll(re)) {
    if (m.index > last) out.push(text(value.slice(last, m.index)))
    if (m[1] !== undefined) out.push(text(m[1], 1))
    else
      out.push(
        block('link', [text(m[2])], {
          // The site prefixes internal links with the current locale itself, so store them without it.
          fields: { linkType: 'custom', newTab: false, url: m[3].replace(/^\/(ru|en)(?=\/)/, '') },
          version: 3,
        }),
      )
    last = m.index + m[0].length
  }
  if (last < value.length) out.push(text(value.slice(last)))
  return out
}

function toLexical(body: string) {
  const children: Node[] = []
  for (const chunk of body.split(/\n{2,}/)) {
    const lines = chunk.split('\n')
    if (chunk.startsWith('## ')) {
      children.push(block('heading', inline(chunk.slice(3).trim()), { tag: 'h2' }))
    } else if (lines.every((l) => l.startsWith('- '))) {
      children.push(
        block(
          'list',
          lines.map((l, i) => block('listitem', inline(l.slice(2)), { value: i + 1 })),
          { listType: 'bullet', start: 1, tag: 'ul' },
        ),
      )
    } else {
      children.push(block('paragraph', inline(lines.join(' '))))
    }
  }
  return {
    root: { children, direction: null, format: '', indent: 0, type: 'root', version: 1 },
  }
}

const name = process.argv[2]
if (!name) throw new Error('usage: publish-pillar.ts <draft-name>, e.g. pillar-frontend-architecture-decisions')
const en = readDraft(`docs/drafts/${name}.en.md`)
const ru = readDraft(`docs/drafts/${name}.ru.md`)
const slug = en.meta.slug
const enTags = en.meta.tags.split(',').map((t) => t.trim())
const ruTags = ru.meta.tags.split(',').map((t) => t.trim())

const payload = await getPayload({ config })
const ctx = { disableRevalidate: false }

const topic = (
  await payload.find({ collection: 'topics', where: { slug: { equals: en.meta.topic } }, limit: 1, depth: 0 })
).docs[0]
if (!topic) throw new Error(`topic ${en.meta.topic} not found`)

const related: number[] = []
for (const s of en.meta.related.split(',').map((x) => x.trim())) {
  const d = (await payload.find({ collection: 'posts', where: { slug: { equals: s } }, limit: 1, depth: 0, locale: 'all' })).docs[0]
  if (!d) throw new Error(`related post not found: ${s}`)
  related.push(d.id)
}

const articles = (
  await payload.find({ collection: 'post-categories', where: { slug: { equals: 'articles' } }, limit: 1, depth: 0 })
).docs[0]
if (!articles) throw new Error('category articles not found')

const now = new Date().toISOString()
let post = (
  await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0, locale: 'all' })
).docs[0]

if (!post) {
  post = await payload.create({
    collection: 'posts',
    locale: 'ru',
    context: ctx,
    data: {
      category: 'article',
      content: toLexical(ru.body) as never,
      description: ru.meta.description,
      featured: false,
      generateSlug: false,
      lastModified: now,
      postCategory: articles.id,
      publishedAt: now,
      readingTime: Number(ru.meta.readingTime),
      relatedPosts: related,
      showOnHome: false,
      slug,
      tags: ruTags.map((tag) => ({ tag })),
      title: ru.meta.title,
      topic: topic.id,
    },
  })
  console.log('created post', post.id)
} else {
  console.log('post exists', post.id, '(will refresh content)')
  post = await payload.update({
    collection: 'posts',
    id: post.id,
    locale: 'ru',
    context: ctx,
    data: {
      content: toLexical(ru.body) as never,
      description: ru.meta.description,
      lastModified: now,
      relatedPosts: related,
      title: ru.meta.title,
      topic: topic.id,
    },
  })
}

const tagRows = (post.tags ?? []) as Array<{ id?: string | null }>
await payload.update({
  collection: 'posts',
  id: post.id,
  locale: 'en',
  context: ctx,
  data: {
    content: toLexical(en.body) as never,
    description: en.meta.description,
    tags: tagRows.map((row, i) => ({ id: row.id ?? undefined, tag: enTags[i] ?? enTags[0] })),
    title: en.meta.title,
  },
})

await payload.update({
  collection: 'topics',
  id: topic.id,
  context: ctx,
  data: { pillar: post.id },
})
console.log('pillar set on topic', topic.id)
process.exit(0)

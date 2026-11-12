import config from '@payload-config'
import { getPayload } from 'payload'

import { buildMarkdownDocument, type MarkdownDocument } from '@/lib/llms'
import { lexicalToMarkdown } from '@/lib/lexical-markdown'
import { getPostDetailBySlug } from '@/lib/post-detail'
import { getProjectDetailBySlug } from '@/lib/project-detail'
import { isProjectPubliclyVisible } from '@/lib/projects'
import { getPublishedPosts } from '@/lib/posts-index'
import { isPubliclyIndexableEntity, pageUrl } from '@/lib/seo'

export type MarkdownKind = 'post' | 'project'
export type MarkdownLocale = 'en' | 'ru'

export function isMarkdownLocale(value: string): value is MarkdownLocale {
  return value === 'en' || value === 'ru'
}

async function bodyToMarkdown(content: unknown): Promise<string> {
  if (!content || typeof content !== 'object') return ''
  try {
    const payload = await getPayload({ config })
    return await lexicalToMarkdown(payload, content as Parameters<typeof lexicalToMarkdown>[1])
  } catch {
    return ''
  }
}

export async function getMarkdownDocument(
  kind: MarkdownKind,
  locale: MarkdownLocale,
  slug: string,
): Promise<MarkdownDocument | null> {
  if (kind === 'post') {
    const { post } = await getPostDetailBySlug(slug, locale)
    if (!post || !isPubliclyIndexableEntity(post)) return null
    return {
      body: await bodyToMarkdown(post.content),
      canonicalUrl: pageUrl(locale, `/posts/${post.slug}`),
      description: post.description ?? '',
      kind,
      locale,
      publishedAt: post.publishedAt,
      slug: post.slug,
      title: post.title,
    }
  }

  const { project } = await getProjectDetailBySlug(slug, locale)
  if (!project || !isProjectPubliclyVisible(project)) return null
  return {
    body: await bodyToMarkdown(project.content),
    canonicalUrl: pageUrl(locale, `/projects/${project.slug}`),
    description: project.description ?? '',
    kind,
    locale,
    slug: project.slug,
    title: project.title,
  }
}

/** Every published post in both locales, serialised as Markdown documents. */
export async function getAllPostMarkdown(): Promise<string[]> {
  const out: string[] = []
  for (const locale of ['ru', 'en'] as const) {
    const posts = await getPublishedPosts(locale)
    for (const post of posts) {
      const doc = await getMarkdownDocument('post', locale, post.slug)
      if (doc) out.push(buildMarkdownDocument(doc))
    }
  }
  return out
}

import Link from 'next/link'
import React from 'react'

import { getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post } from '@/payload-types'

type LexicalNode = {
  children?: LexicalNode[]
  fields?: {
    doc?: Media | null
    linkType?: 'custom' | 'internal'
    newTab?: boolean
    url?: string
  }
  format?: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | number | string
  listType?: 'bullet' | 'check' | 'number'
  relationTo?: string
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text?: string
  type: string
  url?: string
  value?: Media | { alt?: string | null; url?: string | null } | null
} & Record<string, unknown>

const languageLabels: Record<Post['language'], string> = {
  en: 'English',
  es: 'Spanish',
  ru: 'Russian',
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatPostDate(publishedAt?: string | null): string | null {
  if (!publishedAt) {
    return null
  }

  const date = new Date(publishedAt)

  if (Number.isNaN(date.valueOf())) {
    return null
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatText(node: LexicalNode, children: React.ReactNode): React.ReactNode {
  const format = typeof node.format === 'number' ? node.format : 0
  let content = children

  if (format & 1) {
    content = <strong>{content}</strong>
  }

  if (format & 2) {
    content = <em>{content}</em>
  }

  if (format & 8) {
    content = <code>{content}</code>
  }

  if (format & 16) {
    content = <sub>{content}</sub>
  }

  if (format & 32) {
    content = <sup>{content}</sup>
  }

  if (format & 64) {
    content = <span style={{ textDecoration: 'underline' }}>{content}</span>
  }

  if (format & 128) {
    content = <span style={{ textDecoration: 'line-through' }}>{content}</span>
  }

  return content
}

function renderChildren(nodes?: LexicalNode[]): React.ReactNode {
  if (!nodes?.length) {
    return null
  }

  return nodes.map((child, index) => renderNode(child, `${child.type}-${index}`))
}

function extractText(node?: LexicalNode): string {
  if (!node) {
    return ''
  }

  if (typeof node.text === 'string') {
    return node.text
  }

  return node.children?.map((child) => extractText(child)).join('') ?? ''
}

function extractMedia(node: LexicalNode): Media | null {
  if (isMedia(node.value)) {
    return node.value
  }

  if (isMedia(node.fields?.doc)) {
    return node.fields.doc
  }

  const { doc } = node as unknown as { doc?: unknown }

  if (isMedia(doc)) {
    return doc
  }

  return null
}

function renderLink(node: LexicalNode, key: React.Key) {
  const href = node.fields?.linkType === 'custom' ? node.fields.url : node.url || node.fields?.url

  if (!href) {
    return <React.Fragment key={key}>{renderChildren(node.children)}</React.Fragment>
  }

  const content = renderChildren(node.children)

  if (href.startsWith('/')) {
    return (
      <Link href={href} key={key}>
        {content}
      </Link>
    )
  }

  return (
    <a
      href={href}
      key={key}
      rel={node.fields?.newTab ? 'noreferrer' : undefined}
      target={node.fields?.newTab ? '_blank' : undefined}
    >
      {content}
    </a>
  )
}

function renderNode(node: LexicalNode, key: React.Key): React.ReactNode {
  switch (node.type) {
    case 'heading': {
      const Tag = (node.tag ?? 'h2') as keyof React.JSX.IntrinsicElements

      return (
        <Tag className={Tag === 'h2' ? 'project-content-h2' : 'project-content-h3'} key={key}>
          {renderChildren(node.children)}
        </Tag>
      )
    }

    case 'paragraph':
      return <p key={key}>{renderChildren(node.children)}</p>

    case 'quote':
      return (
        <blockquote className="project-content-quote" key={key}>
          {renderChildren(node.children)}
        </blockquote>
      )

    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'

      return <ListTag key={key}>{renderChildren(node.children)}</ListTag>
    }

    case 'listitem':
      return <li key={key}>{renderChildren(node.children)}</li>

    case 'link':
    case 'autolink':
      return renderLink(node, key)

    case 'horizontalrule':
      return <hr className="post-detail-rule" key={key} />

    case 'upload': {
      const media = extractMedia(node)

      if (!media?.url) {
        return null
      }

      return (
        <figure className="post-detail-content-media" key={key}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={media.alt || ''} src={media.url} />
        </figure>
      )
    }

    case 'code':
    case 'codeblock':
      return (
        <pre key={key}>
          <code>{extractText(node)}</code>
        </pre>
      )

    case 'linebreak':
      return <br key={key} />

    case 'text':
      return <React.Fragment key={key}>{formatText(node, node.text ?? '')}</React.Fragment>

    default:
      return <React.Fragment key={key}>{renderChildren(node.children)}</React.Fragment>
  }
}

export function formatPostMeta(post: Pick<Post, 'language' | 'publishedAt' | 'readingTime'>): string[] {
  const items: string[] = []
  const date = formatPostDate(post.publishedAt)

  if (date) {
    items.push(date)
  }

  if (post.readingTime) {
    items.push(`${post.readingTime} min read`)
  }

  items.push(languageLabels[post.language])

  return items
}

export function PostDetailHeader(props: { post: Post }) {
  const { post } = props

  return (
    <header className="post-detail-header">
      <p className="post-detail-label">{getPostCategoryLabel(post.category)}</p>
      <h1>{post.title}</h1>
      <p className="lede">{post.description}</p>
      <div className="post-detail-meta" aria-label="Post metadata">
        {formatPostMeta(post).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </header>
  )
}

export function PostDetailCover(props: { post: Post }) {
  const { post } = props
  const coverImage = isMedia(post.coverImage) ? post.coverImage : null

  if (!coverImage?.url) {
    return null
  }

  return (
    <figure className="project-cover post-detail-cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={coverImage.alt || post.title} src={coverImage.url} />
    </figure>
  )
}

export function PostDetailContent(props: { post: Post }) {
  const { post } = props
  const nodes = post.content?.root?.children as LexicalNode[] | undefined

  if (!nodes?.length) {
    return null
  }

  return <div className="project-content post-detail-content">{renderChildren(nodes)}</div>
}

export function PostDetailPagination(props: {
  nextPost: Post | null
  previousPost: Post | null
}) {
  const { nextPost, previousPost } = props

  if (!nextPost && !previousPost) {
    return null
  }

  return (
    <nav aria-label="Post pagination" className="post-detail-pagination">
      {previousPost ? (
        <Link className="post-detail-pagination-link" href={`/posts/${previousPost.slug}`}>
          <span className="post-detail-pagination-label">Previous</span>
          <span className="row-title">{previousPost.title}</span>
        </Link>
      ) : (
        <span />
      )}

      {nextPost ? (
        <Link className="post-detail-pagination-link post-detail-pagination-link-next" href={`/posts/${nextPost.slug}`}>
          <span className="post-detail-pagination-label">Next</span>
          <span className="row-title">{nextPost.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}

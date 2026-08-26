import Link from 'next/link'
import React from 'react'

import type { Media, Post, Project } from '@/payload-types'

type LexicalNode = {
  children?: LexicalNode[]
  direction?: 'ltr' | 'rtl' | null
  fields?: {
    linkType?: 'custom' | 'internal'
    newTab?: boolean
    url?: string
  }
  format?: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | number | string
  indent?: number
  listType?: 'bullet' | 'check' | 'number'
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text?: string
  type: string
  url?: string
  version?: number
} & Record<string, unknown>

const sectionStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
}

function isMedia(value: number | Media | null | undefined): value is Media {
  return typeof value === 'object' && value !== null
}

function formatProjectDate(project: Project): string | null {
  if (project.year) {
    return String(project.year)
  }

  if (!project.startedAt) {
    return null
  }

  const date = new Date(project.startedAt)

  if (Number.isNaN(date.valueOf())) {
    return null
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatPostMeta(post: Post): string {
  const parts: string[] = [post.category]

  if (post.publishedAt) {
    const date = new Date(post.publishedAt)

    if (!Number.isNaN(date.valueOf())) {
      parts.push(
        new Intl.DateTimeFormat('en', {
          month: 'short',
          year: 'numeric',
        }).format(date),
      )
    }
  }

  if (post.readingTime) {
    parts.push(`${post.readingTime} min`)
  }

  return parts.join(' / ')
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

function renderNode(node: LexicalNode, key: React.Key): React.ReactNode {
  switch (node.type) {
    case 'heading': {
      const Tag = (node.tag ?? 'h2') as keyof React.JSX.IntrinsicElements

      return (
        <Tag
          className={Tag === 'h2' ? 'project-content-h2' : 'project-content-h3'}
          key={key}
        >
          {renderChildren(node.children)}
        </Tag>
      )
    }

    case 'paragraph':
      return (
        <p key={key}>
          {renderChildren(node.children)}
        </p>
      )

    case 'quote':
      return (
        <blockquote className="project-content-quote" key={key}>
          {renderChildren(node.children)}
        </blockquote>
      )

    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'

      return (
        <ListTag key={key}>
          {renderChildren(node.children)}
        </ListTag>
      )
    }

    case 'listitem':
      return <li key={key}>{renderChildren(node.children)}</li>

    case 'link': {
      const href =
        node.fields?.linkType === 'custom' ? node.fields.url : node.url || node.fields?.url

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

    case 'linebreak':
      return <br key={key} />

    case 'text':
      return <React.Fragment key={key}>{formatText(node, node.text ?? '')}</React.Fragment>

    default:
      return <React.Fragment key={key}>{renderChildren(node.children)}</React.Fragment>
  }
}

export function ProjectDetailMeta(props: { project: Project }) {
  const { project } = props
  const date = formatProjectDate(project)
  const items = [
    project.status ? { label: 'Status', value: project.status } : null,
    project.role ? { label: 'Role', value: project.role } : null,
    project.type ? { label: 'Type', value: project.type } : null,
    date ? { label: project.year ? 'Year' : 'Started', value: date } : null,
    project.externalUrl ? { label: 'External', value: project.externalUrl } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))

  if (items.length === 0) {
    return null
  }

  return (
    <div className="project-meta-grid">
      {items.map((item) => (
        <div key={item.label}>
          <p className="project-meta-label">{item.label}</p>
          {item.label === 'External' ? <a href={item.value}>{item.value}</a> : <p>{item.value}</p>}
        </div>
      ))}
    </div>
  )
}

export function ProjectDetailCover(props: { project: Project }) {
  const { project } = props
  const coverImage = isMedia(project.coverImage) ? project.coverImage : null

  if (!coverImage?.url) {
    return null
  }

  return (
    <figure className="project-cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={coverImage.alt || project.title} src={coverImage.url} />
    </figure>
  )
}

export function ProjectDetailContent(props: { project: Project }) {
  const { project } = props
  const nodes = project.content?.root?.children as LexicalNode[] | undefined

  if (!nodes?.length) {
    return null
  }

  return <div className="project-content">{renderChildren(nodes)}</div>
}

export function ProjectDetailRelatedPosts(props: { posts: Post[] }) {
  const { posts } = props

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="section" id="related-posts">
      <div className="section-header">
        <h2 className="section-title">Related posts</h2>
        <Link className="section-link" href="/posts">
          All posts
        </Link>
      </div>

      <div className="project-related-list">
        {posts.map((post) => (
          <Link className="blog-item" href={`/posts/${post.slug}`} key={post.id}>
            <span>
              <span className="blog-title">{post.title}</span>
              <span className="row-desc">{post.description}</span>
            </span>
            <span className="blog-meta">{formatPostMeta(post)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function ProjectDetailContacts(props: {
  links: Array<{ href: string; label: string }>
}) {
  const { links } = props

  if (links.length === 0) {
    return null
  }

  return (
    <section className="section" id="contact">
      <div className="section-header">
        <h2 className="section-title">Contact</h2>
      </div>
      <div className="contact-links">
        {links.map((link) => (
          <a href={link.href} key={link.label}>
            {link.label} →
          </a>
        ))}
      </div>
    </section>
  )
}

export function ProjectDetailBody(props: { children: React.ReactNode }) {
  return <div className="project-detail-body">{props.children}</div>
}

export function ProjectDetailStack(props: { children: React.ReactNode }) {
  return <div style={sectionStackStyle}>{props.children}</div>
}

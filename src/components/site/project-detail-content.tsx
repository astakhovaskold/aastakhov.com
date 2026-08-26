import Link from 'next/link'
import React from 'react'

import { ContentRenderer } from '@/components/site/content-renderer'
import { getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post, Project } from '@/payload-types'

const sectionStackStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '24px' }

function isMedia(value: number | Media | null | undefined): value is Media {
  return typeof value === 'object' && value !== null
}

function formatProjectDate(project: Project): string | null {
  if (project.year) return String(project.year)
  if (!project.startedAt) return null
  const date = new Date(project.startedAt)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

function formatPostMeta(post: Post): string {
  const parts: string[] = [getPostCategoryLabel(post.postCategory)].filter(Boolean)
  if (post.publishedAt) {
    const date = new Date(post.publishedAt)
    if (!Number.isNaN(date.valueOf())) {
      parts.push(new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date))
    }
  }
  if (post.readingTime) parts.push(`${post.readingTime} min`)
  return parts.join(' / ')
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
  if (items.length === 0) return null

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
  if (!coverImage?.url) return null
  return (
    <figure className="project-cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={coverImage.alt || project.title} src={coverImage.url} />
    </figure>
  )
}

export function ProjectDetailContent(props: { project: Project }) {
  return <ContentRenderer content={props.project.content} />
}

export function ProjectDetailRelatedPosts(props: { posts: Post[] }) {
  const { posts } = props
  if (posts.length === 0) return null
  return (
    <section className="section" id="related-posts">
      <div className="section-header">
        <h2 className="section-title">Related posts</h2>
        <Link className="section-link" href="/posts">All posts</Link>
      </div>
      <div className="project-related-list">
        {posts.map((post) => (
          <Link className="blog-item" href={`/posts/${post.slug}`} key={post.id}>
            <span><span className="blog-title">{post.title}</span><span className="row-desc">{post.description}</span></span>
            <span className="blog-meta">{formatPostMeta(post)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function ProjectDetailContacts(props: { links: Array<{ href: string; label: string }> }) {
  const { links } = props
  if (links.length === 0) return null
  return (
    <section className="section" id="contact">
      <div className="section-header"><h2 className="section-title">Contact</h2></div>
      <div className="contact-links">
        {links.map((link) => <a href={link.href} key={link.label}>{link.label} →</a>)}
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

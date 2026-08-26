import Link from 'next/link'

import { AnalyticsLink } from '@/components/site/analytics-link'
import { ContentRenderer } from '@/components/site/content-renderer'
import { getContactLinkEvent } from '@/lib/analytics'
import { getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post, Project } from '@/payload-types'

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
    date ? { label: project.year ? 'Year' : 'Started', value: date } : null,
    project.focus ? { label: 'Focus', value: project.focus } : null,
    project.externalUrl ? { label: 'Project link', value: project.externalUrl } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  if (items.length === 0) return null

  return (
    <dl className="project-meta-grid" aria-label="Project details">
      {items.map((item) => (
        <div className="project-meta-item" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.label === 'Project link' ? <a href={item.value}>{item.value}</a> : item.value}
          </dd>
        </div>
      ))}
    </dl>
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

export function ProjectDetailRelatedPosts(props: { posts: Post[]; title: string }) {
  const { posts, title } = props
  if (posts.length === 0) return null
  const headingId = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <section className="project-detail-section" aria-labelledby={headingId}>
      <div className="section-header">
        <h2 className="section-title" id={headingId}>
          {title}
        </h2>
        <Link className="section-link" href="/posts">
          All posts →
        </Link>
      </div>
      <div className="rows">
        {posts.map((post) => (
          <Link className="row row-link" href={`/posts/${post.slug}`} key={post.id}>
            <span>
              <span className="row-title">{post.title}</span>
              <span className="row-desc">{post.description}</span>
            </span>
            <span className="row-meta">{formatPostMeta(post)}</span>
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
    <section className="project-next-step" id="contact">
      <p>
        If the project direction is relevant to your company, the simplest next step is a short
        conversation about the system, risks, and current technical bottlenecks.
      </p>
      <div className="contact-links">
        {links.map((link) => (
          <AnalyticsLink
            href={link.href}
            key={link.label}
            trackingEvent={getContactLinkEvent(link.label, link.href)}
          >
            {link.label} →
          </AnalyticsLink>
        ))}
      </div>
    </section>
  )
}

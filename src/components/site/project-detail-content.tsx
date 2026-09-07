import { getTranslations } from 'next-intl/server'

import { ArrowLink } from '@/components/site/arrow-link'
import { ContentRenderer } from '@/components/site/content-renderer'
import { Link } from '@/i18n/navigation'
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

export async function ProjectDetailMeta(props: { project: Project }) {
  const { project } = props
  const date = formatProjectDate(project)
  const t = await getTranslations('project')
  const statusLabel = project.status
    ? (t as unknown as (key: string) => string)(`statusValues.${project.status}`)
    : null
  const projectLinkLabel = t('projectLink')
  const items = [
    statusLabel ? { label: t('status'), value: statusLabel } : null,
    project.role ? { label: t('role'), value: project.role } : null,
    date ? { label: project.year ? t('year') : t('started'), value: date } : null,
    project.focus ? { label: t('focus'), value: project.focus } : null,
    project.externalUrl ? { label: projectLinkLabel, value: project.externalUrl } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  if (items.length === 0) return null

  return (
    <dl className="project-meta-grid" aria-label="Project details">
      {items.map((item) => (
        <div className="project-meta-item" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.label === projectLinkLabel ? <a href={item.value}>{item.value}</a> : item.value}
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

export async function ProjectDetailRelatedPosts(props: { posts: Post[]; title: string }) {
  const { posts, title } = props
  if (posts.length === 0) return null
  const headingId = title.toLowerCase().replace(/\s+/g, '-')
  const common = await getTranslations('common')

  return (
    <section className="project-detail-section" aria-labelledby={headingId}>
      <div className="section-header">
        <h2 className="section-title" id={headingId}>
          {title}
        </h2>
        <ArrowLink className="section-link" href="/posts">
          {common('allPosts')}
        </ArrowLink>
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

export async function ProjectDetailContacts(props: {
  links: Array<{ href: string; label: string }>
}) {
  const { links } = props
  if (links.length === 0) return null
  const projectDetailT = await getTranslations('projectDetail')
  return (
    <section className="project-next-step" id="contact">
      <p>{projectDetailT('nextStep')}</p>
      <div className="contact-links">
        {links.map((link) => (
          <ArrowLink
            href={link.href}
            key={link.label}
            trackingEvent={getContactLinkEvent(link.label, link.href)}
          >
            {link.label}
          </ArrowLink>
        ))}
      </div>
    </section>
  )
}

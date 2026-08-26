import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'

import { getPostCategoryLabel, getPostCategoryLinks } from '@/lib/posts-index'
import { getSiteSettings } from '@/lib/siteSettings'
import type { OpenSource, Post, Project } from '@/payload-types'
import './styles.css'

type HomeContent = {
  projects: Project[]
  caseNotes: Post[]
  openSource: OpenSource[]
  blogPosts: Post[]
}

const emptyHomeContent: HomeContent = {
  projects: [],
  caseNotes: [],
  openSource: [],
  blogPosts: [],
}

async function getHomeContent(): Promise<HomeContent> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return emptyHomeContent
  }

  try {
    const payload = await getPayload({ config })
    const [projects, caseNotes, openSource, blogPosts] = await Promise.all([
      payload.find({
        collection: 'projects',
        depth: 0,
        limit: 3,
        sort: ['order', '-year', '-updatedAt'],
        where: {
          featured: {
            equals: true,
          },
        },
      }),
      payload.find({
        collection: 'posts',
        depth: 0,
        limit: 3,
        sort: '-publishedAt',
        where: {
          and: [
            {
              publishedAt: {
                exists: true,
              },
            },
            {
              publishedAt: {
                less_than_equal: new Date().toISOString(),
              },
            },
            {
              'category.kind': {
                equals: 'case',
              },
            },
            {
              showOnHome: {
                equals: true,
              },
            },
          ],
        },
      }),
      payload.find({
        collection: 'open-source',
        depth: 0,
        limit: 3,
        sort: ['order', '-stars', '-updatedAt'],
        where: {
          featured: {
            equals: true,
          },
        },
      }),
      payload.find({
        collection: 'posts',
        depth: 0,
        limit: 3,
        sort: '-publishedAt',
        where: {
          and: [
            {
              publishedAt: {
                exists: true,
              },
            },
            {
              publishedAt: {
                less_than_equal: new Date().toISOString(),
              },
            },
            {
              'category.kind': {
                not_equals: 'case',
              },
            },
            {
              showOnHome: {
                equals: true,
              },
            },
          ],
        },
      }),
    ])

    return {
      projects: projects.docs,
      caseNotes: caseNotes.docs,
      openSource: openSource.docs,
      blogPosts: blogPosts.docs,
    }
  } catch {
    return emptyHomeContent
  }
}

function formatPostMeta(post: Post): string {
  const parts: string[] = [getPostCategoryLabel(post.category)].filter(Boolean)

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

function RowList(props: {
  items: Project[]
  getHref: (item: Project) => string
  getMeta: (item: Project) => string
}) {
  const { items, getHref, getMeta } = props

  return (
    <div className="rows">
      {items.map((item) => (
        <Link className="row row-link" href={getHref(item)} key={item.id}>
          <span>
            <span className="row-title">{item.title}</span>
            <span className="row-desc">{item.description}</span>
          </span>
          <span className="row-meta">{getMeta(item)}</span>
        </Link>
      ))}
    </div>
  )
}

function PostList(props: { items: Post[] }) {
  const { items } = props

  return (
    <div className="blog-list">
      {items.map((post) => (
        <Link className="blog-item" href={`/posts/${post.slug}`} key={post.id}>
          <span className="blog-title">{post.title}</span>
          <span className="blog-meta">{formatPostMeta(post)}</span>
        </Link>
      ))}
    </div>
  )
}

function OpenSourceList(props: { items: OpenSource[] }) {
  const { items } = props

  return (
    <div className="oss-list">
      {items.map((item) => (
        <a className="oss-item" href={item.articleUrl || item.githubUrl} key={item.id}>
          <span>
            <span className="oss-title">{item.name}</span>
            <span className="oss-desc">{item.description}</span>
          </span>
          <span className="oss-meta">{item.stars ? `${item.stars} stars` : 'GitHub'}</span>
        </a>
      ))}
    </div>
  )
}

export default async function HomePage() {
  const [settings, content, categoryLinks] = await Promise.all([
    getSiteSettings(),
    getHomeContent(),
    getPostCategoryLinks(),
  ])
  const caseCategoryLink = categoryLinks.find((category) => category.kind === 'case')
  const topicLinks = [
    { href: '/projects', label: 'Architecture' },
    { href: caseCategoryLink?.href || '/posts', label: 'Audits' },
    { href: '/posts', label: 'Technical notes' },
    { href: '/cv', label: 'Technical leadership' },
  ]
  const contactLinks = [
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    { href: `mailto:${settings.email}`, label: 'Email' },
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
    { href: '/cv', label: 'CV' },
  ].filter((link): link is { href: string; label: string } => Boolean(link))

  const eyebrow = (() => {
    const {location, availability} = settings;

    if (!location && !availability) return '';
    if (!location) return availability;

    return `${location} · ${availability}`;
  })();

  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">
              {eyebrow}
            </p>
            <h1>Builder and technical partner.</h1>
            <p className="lede">
              I help turn complex product and engineering problems into pragmatic software:
              architecture, audits, implementation, and technical leadership.
            </p>
            <nav className="topic-links" aria-label="Topics">
              {topicLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Image
            alt="Askold Astakhov"
            className="hero-avatar"
            height="210"
            src="/askold-avatar.jpeg"
            width="160"
          />
        </div>
      </section>

      {content.projects.length > 0 ? (
        <section className="section" id="projects">
          <div className="section-header">
            <h2 className="section-title">Selected projects</h2>
            <Link className="section-link" href="/projects">
              All projects
            </Link>
          </div>

          <RowList
            getHref={(project) => `/projects/${project.slug}`}
            getMeta={(project) => [project.role, project.year].filter(Boolean).join(' / ')}
            items={content.projects}
          />
        </section>
      ) : null}

      {content.caseNotes.length > 0 ? (
        <section className="section" id="case-notes">
          <div className="section-header">
            <h2 className="section-title">Selected case notes</h2>
            <Link className="section-link" href={caseCategoryLink?.href || '/posts'}>
              All case notes
            </Link>
          </div>

          <PostList items={content.caseNotes} />
        </section>
      ) : null}

      {content.openSource.length > 0 ? (
        <section className="section" id="open-source">
          <div className="section-header">
            <h2 className="section-title">Open Source</h2>
            {settings.github ? (
              <a className="section-link" href={settings.github}>
                GitHub
              </a>
            ) : null}
          </div>

          <OpenSourceList items={content.openSource} />
        </section>
      ) : null}

      {content.blogPosts.length > 0 ? (
        <section className="section" id="blog">
          <div className="section-header">
            <h2 className="section-title">From the blog</h2>
            <Link className="section-link" href="/posts">
              All posts
            </Link>
          </div>

          <PostList items={content.blogPosts} />
        </section>
      ) : null}

      <section className="section" id="contact">
        <div className="section-header">
          <h2 className="section-title">Contacts</h2>
        </div>
        <div className="contact-links">
          {contactLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label} →
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

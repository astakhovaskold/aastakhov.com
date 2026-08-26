import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'

import { getPostCategoryLabel } from '@/lib/posts-index'
import { getSiteSettings, type PublicSiteSettings } from '@/lib/siteSettings'
import type { OpenSource, Post, Project } from '@/payload-types'
import './styles.css'

type HomeContent = {
  featuredPosts: Post[]
  featuredPostsCategoryHref: null | string
  featuredPostsHeading: null | string
  projects: Project[]
  openSource: OpenSource[]
  blogPosts: Post[]
}

const emptyHomeContent: HomeContent = {
  featuredPosts: [],
  featuredPostsCategoryHref: null,
  featuredPostsHeading: null,
  projects: [],
  openSource: [],
  blogPosts: [],
}

async function getHomeContent(settings: PublicSiteSettings): Promise<HomeContent> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return emptyHomeContent
  }

  try {
    const payload = await getPayload({ config })
    const featuredPostsCategoryId =
      typeof settings.featuredPostsCategory?.id === 'number'
        ? settings.featuredPostsCategory.id
        : null
    const [projects, featuredPosts, openSource, blogPosts] = await Promise.all([
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
        depth: 1,
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
              showOnHome: {
                equals: true,
              },
            },
            ...(featuredPostsCategoryId
              ? [
                  {
                    postCategory: {
                      equals: featuredPostsCategoryId,
                    },
                  },
                ]
              : []),
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
        depth: 1,
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
              showOnHome: {
                equals: true,
              },
            },
            ...(featuredPostsCategoryId
              ? [
                  {
                    postCategory: {
                      not_equals: featuredPostsCategoryId,
                    },
                  },
                ]
              : []),
          ],
        },
      }),
    ])

    return {
      featuredPosts: featuredPosts.docs,
      featuredPostsCategoryHref: settings.featuredPostsCategory?.slug
        ? `/posts/category/${settings.featuredPostsCategory.slug}`
        : null,
      featuredPostsHeading: settings.featuredPostsCategory?.title || null,
      projects: projects.docs,
      openSource: openSource.docs,
      blogPosts: blogPosts.docs,
    }
  } catch {
    return emptyHomeContent
  }
}

function formatPostMeta(post: Post): string {
  const parts: string[] = [getPostCategoryLabel(post.postCategory)].filter(Boolean)

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
  const settings = await getSiteSettings()
  const content = await getHomeContent(settings)
  const topicLinks = [
    { href: '/projects', label: 'Architecture' },
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

      {content.featuredPosts.length > 0 ? (
        <section className="section" id="featured-posts">
          <div className="section-header">
            <h2 className="section-title">{content.featuredPostsHeading || 'Selected posts'}</h2>
            {content.featuredPostsCategoryHref ? (
              <Link className="section-link" href={content.featuredPostsCategoryHref}>
                All in category
              </Link>
            ) : (
              <Link className="section-link" href="/posts">
                All posts
              </Link>
            )}
          </div>

          <PostList items={content.featuredPosts} />
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

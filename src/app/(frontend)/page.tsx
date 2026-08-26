import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'

import { ContactLinks } from '@/components/site/contact-links'
import { OpenSourceList } from '@/components/site/open-source-list'
import { PostList } from '@/components/site/post-list'
import { ProjectList } from '@/components/site/project-list'
import { SectionHeader } from '@/components/site/section-header'
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

  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div>
            {settings.homeEyebrow ? <p className="eyebrow">{settings.homeEyebrow}</p> : null}
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
          <SectionHeader action={{ href: '/projects', label: 'All projects' }} title="Selected projects" />

          <ProjectList
            getMeta={(project) => [project.role, project.year].filter(Boolean).join(' / ')}
            items={content.projects}
            showImages={false}
          />
        </section>
      ) : null}

      {content.featuredPosts.length > 0 ? (
        <section className="section" id="featured-posts">
          <SectionHeader
            action={{
              href: content.featuredPostsCategoryHref || '/posts',
              label: content.featuredPostsCategoryHref ? 'All in category' : 'All posts',
            }}
            title={content.featuredPostsHeading || 'Selected posts'}
          />

          <PostList items={content.featuredPosts} showImages={false} />
        </section>
      ) : null}

      {content.openSource.length > 0 ? (
        <section className="section" id="open-source">
          <SectionHeader
            action={settings.github ? { href: settings.github, label: 'GitHub' } : undefined}
            title="Open Source"
          />

          <OpenSourceList items={content.openSource} />
        </section>
      ) : null}

      {content.blogPosts.length > 0 ? (
        <section className="section" id="blog">
          <SectionHeader action={{ href: '/posts', label: 'All posts' }} title="From the blog" />

          <PostList items={content.blogPosts} showImages={false} />
        </section>
      ) : null}

      <section className="section" id="contact">
        <SectionHeader title="Contacts" />
        <ContactLinks links={contactLinks} />
      </section>
    </>
  )
}

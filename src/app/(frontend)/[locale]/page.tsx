import config from '@payload-config'
import Image from 'next/image'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'
import { getPayload } from 'payload'

import { ContactLinks } from '@/components/site/contact-links'
import { OpenSourceList } from '@/components/site/open-source-list'
import { PostList } from '@/components/site/post-list'
import { SelectedWorkList } from '@/components/site/selected-work-list'
import { SectionHeader } from '@/components/site/section-header'
import { routing } from '@/i18n/routing'
import { getSiteSettings, type PublicSiteSettings } from '@/lib/siteSettings'
import type { OpenSource, Post } from '@/payload-types'

type HomeContent = {
  openSource: OpenSource[]
  blogPosts: Post[]
}

const emptyHomeContent: HomeContent = {
  openSource: [],
  blogPosts: [],
}

async function getHomeContent(
  settings: PublicSiteSettings,
  locale: string,
): Promise<HomeContent> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return emptyHomeContent
  }

  try {
    const payload = await getPayload({ config })
    const selectedWorkPostIds = settings.selectedWork.map((item) => item.post.id)
    const [openSource, blogPosts] = await Promise.all([
      payload.find({
        collection: 'open-source',
        depth: 0,
        limit: 3,
        locale: locale as 'en' | 'ru',
        fallbackLocale: 'ru',
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
        locale: locale as 'en' | 'ru',
        fallbackLocale: 'ru',
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
            ...(selectedWorkPostIds.length > 0
              ? [
                  {
                    id: {
                      not_in: selectedWorkPostIds,
                    },
                  },
                ]
              : []),
          ],
        },
      }),
    ])

    return {
      openSource: openSource.docs,
      blogPosts: blogPosts.docs,
    }
  } catch {
    return emptyHomeContent
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [settings, t, common] = await Promise.all([
    getSiteSettings(locale),
    getTranslations('home'),
    getTranslations('common'),
  ])
  const content = await getHomeContent(settings, locale)
  const contactLinks = [
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    { href: `mailto:${settings.email}`, label: 'Email' },
    settings.bookingUrl ? { href: settings.bookingUrl, label: 'Book a call' } : null,
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
    { href: '/cv', label: 'CV' },
  ].filter((link): link is { href: string; label: string } => Boolean(link))

  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">
              {settings.location} · {settings.availability}
            </p>
            <h1>
              {settings.homePage.heroTitleLine1}
              <br />
              {settings.homePage.heroTitleLine2}
            </h1>
            <p className="lede">{settings.homePage.heroDescription}</p>
            <div className="topic-links" aria-label={common('topics')}>
              {settings.homePage.heroTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
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

      {settings.selectedWork.length > 0 ? (
        <section className="section" id="work">
          <SectionHeader
            action={{ href: '/posts', label: common('allPosts') }}
            title={t('selectedWork')}
          />
          <SelectedWorkList
            items={settings.selectedWork.map((item) => ({
              caption: item.caption,
              description: item.post.description,
              id: item.post.id,
              slug: item.post.slug,
              title: item.post.title,
            }))}
          />
        </section>
      ) : null}

      {settings.services.length > 0 ? (
        <section className="section" id="services">
          <SectionHeader title={t('services')} />
          <div className="expertise-grid">
            {settings.services.map((service) => (
              <article className="expertise-item" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {content.blogPosts.length > 0 ? (
        <section className="section" id="blog">
          <SectionHeader
            action={{ href: '/posts', label: common('allPosts') }}
            title={t('fromTheBlog')}
          />

          <PostList items={content.blogPosts} presentation="compact" showImages={false} />
        </section>
      ) : null}

      {content.openSource.length > 0 ? (
        <section className="section" id="open-source">
          <SectionHeader
            action={settings.github ? { href: settings.github, label: 'GitHub' } : undefined}
            title={t('openSource')}
          />

          <OpenSourceList items={content.openSource} />
        </section>
      ) : null}

      <section className="section" id="contact">
        <SectionHeader title={common('contacts')} />
        <ContactLinks links={contactLinks} />
      </section>
    </>
  )
}

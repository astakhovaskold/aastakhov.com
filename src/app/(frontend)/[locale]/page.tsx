import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'
import { getPayload } from 'payload'

import { ContactLinks } from '@/components/site/contact-links'
import { OpenSourceList } from '@/components/site/open-source-list'
import { PostList } from '@/components/site/post-list'
import { PrimaryContactButton } from '@/components/site/primary-contact-button'
import { SelectedWorkList } from '@/components/site/selected-work-list'
import { SectionHeader } from '@/components/site/section-header'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getPrimaryContact } from '@/lib/contact'
import { createSeoMetadata } from '@/lib/seo'
import { getSiteSettings, type PublicSiteSettings } from '@/lib/siteSettings'
import { getTopicsWithPosts } from '@/lib/topics'
import type { OpenSource, Post } from '@/payload-types'

type HomePageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const settings = await getSiteSettings(locale)

  return createSeoMetadata({
    canonicalPath: '/',
    description: settings.seo.defaultDescription,
    locale: locale as 'ru' | 'en',
    settings,
    title: settings.seo.defaultTitle,
  })
}

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
  const [content, topics] = await Promise.all([
    getHomeContent(settings, locale),
    getTopicsWithPosts(locale),
  ])
  const primaryContact = getPrimaryContact(settings)
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
              {settings.homeEyebrow || `${settings.location} · ${settings.availability}`}
            </p>
            <h1>
              <span className="hero-line">{settings.homePage.heroTitleLine1}</span>{' '}
              <span className="hero-line">{settings.homePage.heroTitleLine2}</span>
            </h1>
            <p className="lede">{settings.homePage.heroDescription}</p>
            {primaryContact ? (
              <PrimaryContactButton
                contact={primaryContact}
                label={t(primaryContact.kind === 'booking' ? 'primaryBooking' : 'primaryTelegram')}
              />
            ) : null}
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

      {settings.proof.length > 0 ? (
        <section className="section" id="proof">
          <SectionHeader title={t('proof')} />
          <div className="expertise-grid">
            {settings.proof.map((item) => (
              <article className="expertise-item" key={item.title}>
                <h3>{item.title}</h3>
                {item.description ? <p>{item.description}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {topics.length > 0 ? (
        <section className="section" id="topics">
          <SectionHeader title={common('topics')} />
          <div className="topic-links" aria-label={common('topics')}>
            {topics.map((topic) => (
              <Link href={`/topics/${topic.slug}`} key={topic.id}>
                {topic.title}
              </Link>
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

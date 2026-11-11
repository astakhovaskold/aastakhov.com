import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/site/post-list'
import { SectionHeader } from '@/components/site/section-header'
import { StructuredData } from '@/components/site/structured-data'
import { routing } from '@/i18n/routing'
import { createNotFoundMetadata, createSeoMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'
import {
  breadcrumbName,
  createBreadcrumbSchema,
  createCollectionPageSchema,
} from '@/lib/structured-data'
import { getTopicPageData } from '@/lib/topics'

type TopicPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const [data, settings] = await Promise.all([getTopicPageData(locale, slug), getSiteSettings(locale)])

  if (!data) {
    return createNotFoundMetadata({ resource: 'Topic' })
  }

  return createSeoMetadata({
    canonicalPath: `/topics/${slug}`,
    description: data.topic.description,
    locale: locale as 'ru' | 'en',
    settings,
    title: data.topic.title,
  })
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [data, t] = await Promise.all([getTopicPageData(locale, slug), getTranslations('topic')])

  if (!data) {
    notFound()
  }

  const { pillar, posts, topic } = data
  const ordered = pillar ? [pillar, ...posts] : posts

  return (
    <>
      <StructuredData
        data={[
          createCollectionPageSchema({
            description: topic.description || topic.title,
            items: ordered.map((post) => ({ name: post.title, path: `/posts/${post.slug}` })),
            locale: locale as 'en' | 'ru',
            path: `/topics/${slug}`,
            title: topic.title,
          }),
          createBreadcrumbSchema(locale as 'en' | 'ru', [
            { name: breadcrumbName(locale as 'en' | 'ru', 'home'), path: '/' },
            { name: topic.title, path: `/topics/${slug}` },
          ]),
        ]}
      />
      <section className="hero">
        <p className="eyebrow">{t('topicHub')}</p>
        <h1>{topic.title}</h1>
        {topic.description ? <p className="lede">{topic.description}</p> : null}
      </section>

      {pillar ? (
        <section className="section" id="topic-pillar">
          <SectionHeader title={t('startHere')} />
          <PostList items={[pillar]} />
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section className="section" id="topic-posts">
          <SectionHeader title={t('morePosts')} />
          <PostList items={posts} />
        </section>
      ) : null}
    </>
  )
}

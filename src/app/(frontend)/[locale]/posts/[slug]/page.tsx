import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ContactLinks } from '@/components/site/contact-links'
import { StructuredData } from '@/components/site/structured-data'
import {
  PostDetailContent,
  PostDetailCover,
  PostDetailHeader,
} from '@/components/site/post-detail-content'
import { MarkdownExport } from '@/components/site/markdown-export'
import { PostConsultationCta } from '@/components/site/post-consultation-cta'
import { PostList } from '@/components/site/post-list'
import { TableOfContents } from '@/components/site/table-of-contents'
import { SectionHeader } from '@/components/site/section-header'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getPostDetailBySlug } from '@/lib/post-detail'
import { extractHeadingsFromLexical } from '@/lib/lexical-headings'
import { getPostLastModifiedDate } from '@/lib/post-dates'
import {
  createNotFoundMetadata,
  createSeoMetadata,
  isPubliclyIndexableEntity,
} from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'
import { getPostMoreData } from '@/lib/topics'
import { breadcrumbName, createBlogPostingSchema, createBreadcrumbSchema } from '@/lib/structured-data'

type PostDetailPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const [{ post }, settings] = await Promise.all([
    getPostDetailBySlug(slug, locale),
    getSiteSettings(locale),
  ])
  const canonicalPath = `/posts/${slug}`

  if (!post || !isPubliclyIndexableEntity(post)) {
    return createNotFoundMetadata({
      canonicalPath,
      locale: locale as 'ru' | 'en',
      resource: 'Post',
      settings,
    })
  }

  const lastModified = getPostLastModifiedDate(post).toISOString()

  return createSeoMetadata({
    canonicalPath,
    entity: post,
    locale: locale as 'ru' | 'en',
    publishedTime: post.publishedAt,
    modifiedTime: lastModified,
    settings,
    type: 'article',
  })
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [{ post }, settings, common, topicT, tocT, ctaT] = await Promise.all([
    getPostDetailBySlug(slug, locale),
    getSiteSettings(locale),
    getTranslations('common'),
    getTranslations('topic'),
    getTranslations('toc'),
    getTranslations('postCta'),
  ])

  if (!post || !isPubliclyIndexableEntity(post)) {
    notFound()
  }

  const moreData = await getPostMoreData(post, locale)

  const contactLinks = [
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    { href: `mailto:${settings.email}`, label: 'Email' },
    settings.bookingUrl ? { href: settings.bookingUrl, label: 'Book a call' } : null,
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
    { href: '/cv', label: 'CV' },
  ].filter((link): link is { href: string; label: string } => Boolean(link))

  const lastModified = getPostLastModifiedDate(post).toISOString()

  return (
    <>
      <StructuredData
        data={[
          createBlogPostingSchema({
            dateModified: lastModified,
            description: post.description,
            image: typeof post.coverImage === 'object' ? post.coverImage?.url : undefined,
            locale: locale as 'en' | 'ru',
            path: `/posts/${post.slug}`,
            publishedAt: post.publishedAt,
            title: post.title,
          }),
          createBreadcrumbSchema(locale as 'en' | 'ru', [
            { name: breadcrumbName(locale as 'en' | 'ru', 'home'), path: '/' },
            { name: common('allPosts'), path: '/posts' },
            { name: post.title, path: `/posts/${post.slug}` },
          ]),
        ]}
      />
      <div className="post-layout">
        {post.coverImage || post.content?.root?.children?.length ? (
          <aside className="post-aside">
            <div className="post-aside-inner">
              <MarkdownExport kind="posts" slug={post.slug} />
              <TableOfContents headings={extractHeadingsFromLexical(post.content)} title={tocT('title')} />
            </div>
          </aside>
        ) : null}

        <section className="hero">
          <div className="post-detail-shell">
            {post.eyebrow ? <p className="eyebrow">{post.eyebrow}</p> : null}
            <PostDetailHeader post={post} />
          </div>
        </section>

        {post.coverImage || post.content?.root?.children?.length ? (
          <section className="section">
            <div className="post-detail-shell">
              <PostDetailCover post={post} />
              <PostDetailContent post={post} />
              <PostConsultationCta settings={settings} text={ctaT('text')} title={ctaT('title')} />
            </div>
          </section>
        ) : null}
      </div>

      <section className="section" id="post-more">
        <div className="post-detail-shell">
          <SectionHeader action={{ href: '/posts', label: common('allPosts') }} title={common('more')} />
          {moreData.topic ? (
            <p className="post-topic-link">
              {topicT('partOf')}:{' '}
              <Link href={`/topics/${moreData.topic.slug}`}>{moreData.topic.title}</Link>
              {moreData.pillar ? (
                <>
                  {' · '}
                  {topicT('startHere')}:{' '}
                  <Link href={`/posts/${moreData.pillar.slug}`}>{moreData.pillar.title}</Link>
                </>
              ) : null}
            </p>
          ) : null}
          {moreData.more.length > 0 ? <PostList items={moreData.more} /> : null}
        </div>
      </section>

      <section className="section" id="contact">
        <div className="post-detail-shell">
          <SectionHeader title={common('contacts')} />
          <ContactLinks links={contactLinks} />
        </div>
      </section>
    </>
  )
}

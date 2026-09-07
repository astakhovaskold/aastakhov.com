import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ContactLinks } from '@/components/site/contact-links'
import {
  PostDetailContent,
  PostDetailCover,
  PostDetailHeader,
  PostDetailPagination,
} from '@/components/site/post-detail-content'
import { SectionHeader } from '@/components/site/section-header'
import { routing } from '@/i18n/routing'
import { getPostDetailBySlug } from '@/lib/post-detail'
import {
  createNotFoundMetadata,
  createSeoMetadata,
  isPubliclyIndexableEntity,
} from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'

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

  return createSeoMetadata({
    canonicalPath,
    entity: post,
    locale: locale as 'ru' | 'en',
    publishedTime: post.publishedAt,
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

  const [{ nextPost, post, previousPost }, settings, common] = await Promise.all([
    getPostDetailBySlug(slug, locale),
    getSiteSettings(locale),
    getTranslations('common'),
  ])

  if (!post || !isPubliclyIndexableEntity(post)) {
    notFound()
  }

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
          </div>
        </section>
      ) : null}

      <section className="section" id="post-more">
        <div className="post-detail-shell">
          <SectionHeader action={{ href: '/posts', label: common('allPosts') }} title={common('more')} />
          <PostDetailPagination nextPost={nextPost} previousPost={previousPost} />
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

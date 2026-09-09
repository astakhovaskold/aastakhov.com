import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ContactLinks } from '@/components/site/contact-links'
import { FeaturedPost } from '@/components/site/featured-post'
import { PostList } from '@/components/site/post-list'
import { PostCategoryNav } from '@/components/site/post-index-list'
import { SectionHeader } from '@/components/site/section-header'
import { routing } from '@/i18n/routing'
import { createSeoMetadata } from '@/lib/seo'
import { getPostsIndexPageData } from '@/lib/posts-index'
import { getSiteSettings } from '@/lib/siteSettings'

type PostsPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PostsPageProps): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return createSeoMetadata({
    canonicalPath: '/posts',
    description: settings.blogPage.description,
    locale: locale as 'ru' | 'en',
    settings,
    title: settings.blogPage.title,
  })
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [{ categoryLinks, featuredPost, posts }, settings, common, postT] = await Promise.all([
    getPostsIndexPageData(locale),
    getSiteSettings(locale),
    getTranslations('common'),
    getTranslations('post'),
  ])

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
        {settings.postsEyebrow ? <p className="eyebrow">{settings.postsEyebrow}</p> : null}
        <h1>{settings.blogPage.title}</h1>
        <p className="lede">{settings.blogPage.description}</p>
      </section>

      {featuredPost ? (
        <section className="section" id="featured-post">
          <SectionHeader title={postT('featuredPost')} />

          <FeaturedPost post={featuredPost} />
        </section>
      ) : null}

      <section className="section" id="posts-list">
        <SectionHeader title={common('allPosts')} />

        {posts.length > 0 ? <PostList items={posts} /> : <p>{common('noPostsPublished')}</p>}
      </section>

      {categoryLinks.length > 0 ? (
        <section className="section" id="post-categories">
          <SectionHeader title={common('topics')} />

          <PostCategoryNav categoryLinks={categoryLinks} currentSlug={null} />
        </section>
      ) : null}

      <section className="section" id="contact">
        <SectionHeader title={common('contacts')} />
        <ContactLinks links={contactLinks} />
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/site/post-list'
import { PostCategoryNav } from '@/components/site/post-index-list'
import { SectionHeader } from '@/components/site/section-header'
import { routing } from '@/i18n/routing'
import {
  getPostCategoryBySlug,
  getPostCategoryLinks,
  getPostCategoryLinksWithPosts,
  getPublishedPosts,
} from '@/lib/posts-index'
import { createNotFoundMetadata, createSeoMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'

type PostCategoryPageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: PostCategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const [allCategoryLinks, settings] = await Promise.all([
    getPostCategoryLinks(locale, { includeHidden: true }),
    getSiteSettings(locale),
  ])
  const category = getPostCategoryBySlug(allCategoryLinks, slug)
  const canonicalPath = `/posts/category/${slug}`

  if (!category) {
    return createNotFoundMetadata({
      canonicalPath,
      locale: locale as 'ru' | 'en',
      resource: 'Category',
      settings,
    })
  }

  return createSeoMetadata({
    canonicalPath,
    description: category.description || `${category.label} by Askold Astakhov.`,
    locale: locale as 'ru' | 'en',
    settings,
    title: category.label,
  })
}

export default async function PostCategoryPage({ params }: PostCategoryPageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [categoryLinks, allCategoryLinks, common] = await Promise.all([
    getPostCategoryLinksWithPosts(locale),
    getPostCategoryLinks(locale, { includeHidden: true }),
    getTranslations('common'),
  ])
  const category = getPostCategoryBySlug(allCategoryLinks, slug)

  if (!category) {
    notFound()
  }

  const posts = await getPublishedPosts(locale, category.id)

  return (
    <>
      <section className="hero">
        {category.eyebrow ? <p className="eyebrow">{category.eyebrow}</p> : null}
        <h1>{category.label}</h1>
        <p className="lede">{category.description || `${category.label} by Askold Astakhov.`}</p>
      </section>

      {categoryLinks.length > 0 ? (
        <section className="section" id="post-categories">
          <SectionHeader title={common('topics')} />

          <PostCategoryNav categoryLinks={categoryLinks} currentSlug={category.slug} />
        </section>
      ) : null}

      <section className="section" id="posts-list">
        <SectionHeader title={category.label} />

        {posts.length > 0 ? <PostList items={posts} /> : <p>{common('noPostsPublished')}</p>}
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/site/post-list'
import { PostCategoryNav } from '@/components/site/post-index-list'
import { SectionHeader } from '@/components/site/section-header'
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
    slug: string
  }>
}

export async function generateMetadata({ params }: PostCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const [allCategoryLinks, settings] = await Promise.all([
    getPostCategoryLinks({ includeHidden: true }),
    getSiteSettings(),
  ])
  const category = getPostCategoryBySlug(allCategoryLinks, slug)
  const canonicalPath = `/posts/category/${slug}`

  if (!category) {
    return createNotFoundMetadata({
      canonicalPath,
      resource: 'Category',
      settings,
    })
  }

  return createSeoMetadata({
    canonicalPath,
    description: category.description || `${category.label} by Askold Astakhov.`,
    settings,
    title: category.label,
  })
}

export default async function PostCategoryPage({ params }: PostCategoryPageProps) {
  const { slug } = await params
  const [categoryLinks, allCategoryLinks] = await Promise.all([
    getPostCategoryLinksWithPosts(),
    getPostCategoryLinks({ includeHidden: true }),
  ])
  const category = getPostCategoryBySlug(allCategoryLinks, slug)

  if (!category) {
    notFound()
  }

  const posts = await getPublishedPosts(category.id)

  return (
    <>
      <section className="hero">
        {category.eyebrow ? <p className="eyebrow">{category.eyebrow}</p> : null}
        <h1>{category.label}</h1>
        <p className="lede">{category.description || `${category.label} by Askold Astakhov.`}</p>
      </section>

      {categoryLinks.length > 0 ? (
        <section className="section" id="post-categories">
          <SectionHeader title="Topics" />

          <PostCategoryNav categoryLinks={categoryLinks} currentSlug={category.slug} />
        </section>
      ) : null}

      <section className="section" id="posts-list">
        <SectionHeader title={category.label} />

        {posts.length > 0 ? <PostList items={posts} /> : <p>No posts published yet.</p>}
      </section>
    </>
  )
}

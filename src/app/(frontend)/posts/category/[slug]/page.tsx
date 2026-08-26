import { notFound } from 'next/navigation'

import { PostList } from '@/components/site/post-list'
import { PostCategoryNav } from '@/components/site/post-index-list'
import { SectionHeader } from '@/components/site/section-header'
import {
  getPostCategoryBySlug,
  getPostCategoryLinks,
  getPublishedPosts,
} from '@/lib/posts-index'

type PostCategoryPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function PostCategoryPage({ params }: PostCategoryPageProps) {
  const { slug } = await params
  const [categoryLinks, allCategoryLinks] = await Promise.all([
    getPostCategoryLinks(),
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
        <p className="eyebrow">Posts category</p>
        <h1>{category.label}</h1>
        <p className="lede">{category.description || `${category.label} by Askold Astakhov.`}</p>
      </section>

      <section className="section" id="post-categories">
        <SectionHeader title="Categories" />

        <PostCategoryNav categoryLinks={categoryLinks} currentSlug={category.slug} />
      </section>

      <section className="section" id="posts-list">
        <SectionHeader title={category.label} />

        {posts.length > 0 ? <PostList items={posts} /> : <p>No posts published yet.</p>}
      </section>
    </>
  )
}

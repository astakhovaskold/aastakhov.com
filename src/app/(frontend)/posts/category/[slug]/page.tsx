import { notFound } from 'next/navigation'

import { PostCategoryNav, PostIndexList } from '@/components/site/post-index-list'
import { getPostCategoryBySlug, getPublishedPosts, type PostCategorySlug } from '@/lib/posts-index'

type PostCategoryPageProps = {
  params: Promise<{
    slug: string
  }>
}

function getCategoryDescription(slug: PostCategorySlug): string {
  switch (slug) {
    case 'cases':
      return 'Technical notes based on real product, architecture and delivery problems.'
    case 'articles':
      return 'Long-form writing about architecture, delivery and product engineering.'
    case 'notes':
      return 'Short practical notes about implementation, quality and technical decisions.'
    case 'guides':
      return 'Step-by-step explanations for building, shipping and maintaining software.'
    case 'essays':
      return 'Reflective writing on engineering craft, systems thinking and technical leadership.'
  }
}

export default async function PostCategoryPage({ params }: PostCategoryPageProps) {
  const { slug } = await params
  const category = getPostCategoryBySlug(slug)

  if (!category?.value || !category.slug) {
    notFound()
  }

  const posts = await getPublishedPosts(category.value)

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Posts category</p>
        <h1>{category.label}</h1>
        <p className="lede">{getCategoryDescription(category.slug)}</p>
      </section>

      <section className="section" id="post-categories">
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
        </div>

        <PostCategoryNav currentSlug={category.slug} />
      </section>

      <section className="section" id="posts-list">
        <div className="section-header">
          <h2 className="section-title">{category.label}</h2>
        </div>

        {posts.length > 0 ? <PostIndexList items={posts} /> : <p>No posts published yet.</p>}
      </section>
    </>
  )
}

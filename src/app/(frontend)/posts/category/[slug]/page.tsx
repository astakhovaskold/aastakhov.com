import { notFound } from 'next/navigation'

import { PostCategoryNav, PostIndexList } from '@/components/site/post-index-list'
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
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
        </div>

        <PostCategoryNav categoryLinks={categoryLinks} currentSlug={category.slug} />
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

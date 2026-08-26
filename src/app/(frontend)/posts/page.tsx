import { PostCategoryNav, PostIndexList } from '@/components/site/post-index-list'
import { getPublishedPosts } from '@/lib/posts-index'

export default async function PostsPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Notes · Articles · Engineering practice</p>
        <h1>Posts about building digital products</h1>
        <p className="lede">
          Notes on frontend architecture, delivery, web quality, technical leadership and
          practical product engineering.
        </p>
      </section>

      <section className="section" id="post-categories">
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
        </div>

        <PostCategoryNav currentSlug={null} />
      </section>

      <section className="section" id="posts-list">
        <div className="section-header">
          <h2 className="section-title">All posts</h2>
        </div>

        {posts.length > 0 ? <PostIndexList items={posts} /> : <p>No posts published yet.</p>}
      </section>
    </>
  )
}

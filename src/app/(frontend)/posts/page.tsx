import { PostCategoryNav, PostIndexList } from '@/components/site/post-index-list'
import { getPostsIndexPageData } from '@/lib/posts-index'

export default async function PostsPage() {
  const { categoryLinks, posts } = await getPostsIndexPageData()

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Writing and notes</p>
        <h1>Posts</h1>
        <p className="lede">
          Writing, notes, case studies, and practical material on building digital products.
        </p>
      </section>

      <section className="section" id="post-categories">
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
        </div>

        <PostCategoryNav categoryLinks={categoryLinks} currentSlug={null} />
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

import { PostList } from '@/components/site/post-list'
import { PostCategoryNav } from '@/components/site/post-index-list'
import { SectionHeader } from '@/components/site/section-header'
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
        <SectionHeader title="Categories" />

        <PostCategoryNav categoryLinks={categoryLinks} currentSlug={null} />
      </section>

      <section className="section" id="posts-list">
        <SectionHeader title="All posts" />

        {posts.length > 0 ? <PostList items={posts} /> : <p>No posts published yet.</p>}
      </section>
    </>
  )
}

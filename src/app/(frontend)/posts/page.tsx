import type { Metadata } from 'next'

import { PostList } from '@/components/site/post-list'
import { PostCategoryNav } from '@/components/site/post-index-list'
import { SectionHeader } from '@/components/site/section-header'
import { createSeoMetadata } from '@/lib/seo'
import { getPostsIndexPageData } from '@/lib/posts-index'
import { getSiteSettings } from '@/lib/siteSettings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return createSeoMetadata({
    canonicalPath: '/posts',
    description: 'Writing, notes, case studies, and practical material on building digital products.',
    settings,
    title: 'Posts',
  })
}

export default async function PostsPage() {
  const [{ categoryLinks, posts }, settings] = await Promise.all([getPostsIndexPageData(), getSiteSettings()])

  return (
    <>
      <section className="hero">
        {settings.postsEyebrow ? <p className="eyebrow">{settings.postsEyebrow}</p> : null}
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

import type { Metadata } from 'next'

import { ContactLinks } from '@/components/site/contact-links'
import { FeaturedPost } from '@/components/site/featured-post'
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
  const [{ categoryLinks, featuredPost, posts }, settings] = await Promise.all([
    getPostsIndexPageData(),
    getSiteSettings(),
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
        <h1>Posts</h1>
        <p className="lede">
          Writing, notes, case studies, and practical material on building digital products.
        </p>
      </section>

      {featuredPost ? (
        <section className="section" id="featured-post">
          <SectionHeader title="Featured post" />

          <FeaturedPost post={featuredPost} />
        </section>
      ) : null}

      <section className="section" id="posts-list">
        <SectionHeader title="All posts" />

        {posts.length > 0 ? <PostList items={posts} /> : <p>No posts published yet.</p>}
      </section>

      <section className="section" id="post-categories">
        <SectionHeader title="Topics" />

        <PostCategoryNav categoryLinks={categoryLinks} currentSlug={null} />
      </section>

      <section className="section" id="contact">
        <SectionHeader title="Contacts" />
        <ContactLinks links={contactLinks} />
      </section>
    </>
  )
}

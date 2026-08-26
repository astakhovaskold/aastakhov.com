import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  PostDetailContent,
  PostDetailCover,
  PostDetailHeader,
  PostDetailPagination,
} from '@/components/site/post-detail-content'
import { getPostDetailBySlug } from '@/lib/post-detail'
import {
  createNotFoundMetadata,
  createSeoMetadata,
  isPubliclyIndexableEntity,
} from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'

type PostDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const [{ post }, settings] = await Promise.all([
    getPostDetailBySlug(slug),
    getSiteSettings(),
  ])
  const canonicalPath = `/posts/${slug}`

  if (!post || !isPubliclyIndexableEntity(post)) {
    return createNotFoundMetadata({
      canonicalPath,
      resource: 'Post',
      settings,
    })
  }

  return createSeoMetadata({
    canonicalPath,
    entity: post,
    publishedTime: post.publishedAt,
    settings,
    type: 'article',
  })
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params
  const { nextPost, post, previousPost } = await getPostDetailBySlug(slug)

  if (!post || !isPubliclyIndexableEntity(post)) {
    notFound()
  }

  return (
    <>
      <section className="hero">
        <div className="post-detail-shell">
          {post.eyebrow ? <p className="eyebrow">{post.eyebrow}</p> : null}
          <PostDetailHeader post={post} />
        </div>
      </section>

      {post.coverImage || post.content?.root?.children?.length ? (
        <section className="section">
          <div className="post-detail-shell">
            <PostDetailCover post={post} />
            <PostDetailContent post={post} />
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="post-detail-shell">
          <Link className="post-detail-back-link" href="/posts">
            Back to posts
          </Link>
          <PostDetailPagination nextPost={nextPost} previousPost={previousPost} />
        </div>
      </section>
    </>
  )
}

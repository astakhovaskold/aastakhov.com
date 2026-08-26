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

type PostDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const { post } = await getPostDetailBySlug(slug)

  if (!post) {
    return {
      title: 'Post not found',
    }
  }

  return {
    description: post.seo?.description || post.description,
    title: post.seo?.title || post.title,
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params
  const { nextPost, post, previousPost } = await getPostDetailBySlug(slug)

  if (!post) {
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

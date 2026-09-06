import Link from 'next/link'
import React from 'react'

import { ContentRenderer } from '@/components/site/content-renderer'
import { getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post } from '@/payload-types'

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatPostDate(publishedAt?: string | null): string | null {
  if (!publishedAt) return null
  const date = new Date(publishedAt)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function PostDetailHeader(props: { post: Post }) {
  const { post } = props
  const metaLine = [
    getPostCategoryLabel(post.postCategory),
    formatPostDate(post.publishedAt),
    post.readingTime ? `${post.readingTime} min read` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <header className="post-detail-header">
      {metaLine ? <p className="post-detail-label">{metaLine}</p> : null}
      <h1>{post.title}</h1>
      <p className="lede">{post.description}</p>
    </header>
  )
}

export function PostDetailCover(props: { post: Post }) {
  const { post } = props
  const coverImage = isMedia(post.coverImage) ? post.coverImage : null
  if (!coverImage?.url) return null
  return (
    <figure className="project-cover post-detail-cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={coverImage.alt || post.title} src={coverImage.url} />
    </figure>
  )
}

export function PostDetailContent(props: { post: Post }) {
  return <ContentRenderer content={props.post.content} />
}

export function PostDetailPagination(props: { nextPost: Post | null; previousPost: Post | null }) {
  const { nextPost, previousPost } = props
  if (!nextPost && !previousPost) return null
  return (
    <nav aria-label="Post pagination" className="contact-links">
      {previousPost ? (
        <Link href={`/posts/${previousPost.slug}`}>Previous post →</Link>
      ) : null}
      {nextPost ? (
        <Link href={`/posts/${nextPost.slug}`}>Next post →</Link>
      ) : null}
    </nav>
  )
}

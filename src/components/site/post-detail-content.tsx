import Link from 'next/link'
import React from 'react'

import { ContentRenderer } from '@/components/site/content-renderer'
import { getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post } from '@/payload-types'

const languageLabels: Record<Post['language'], string> = { en: 'English', es: 'Spanish', ru: 'Russian' }

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatPostDate(publishedAt?: string | null): string | null {
  if (!publishedAt) return null
  const date = new Date(publishedAt)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function formatPostMeta(post: Pick<Post, 'language' | 'publishedAt' | 'readingTime'>): string[] {
  const items: string[] = []
  const date = formatPostDate(post.publishedAt)
  if (date) items.push(date)
  if (post.readingTime) items.push(`${post.readingTime} min read`)
  items.push(languageLabels[post.language])
  return items
}

export function PostDetailHeader(props: { post: Post }) {
  const { post } = props
  return (
    <header className="post-detail-header">
      <p className="post-detail-label">{getPostCategoryLabel(post.postCategory)}</p>
      <h1>{post.title}</h1>
      <p className="lede">{post.description}</p>
      <div className="post-detail-meta" aria-label="Post metadata">
        {formatPostMeta(post).map((item) => <span key={item}>{item}</span>)}
      </div>
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
    <nav aria-label="Post pagination" className="post-detail-pagination">
      {previousPost ? (
        <Link className="post-detail-pagination-link" href={`/posts/${previousPost.slug}`}>
          <span className="post-detail-pagination-label">Previous</span>
          <span className="row-title">{previousPost.title}</span>
        </Link>
      ) : <span />}
      {nextPost ? (
        <Link className="post-detail-pagination-link post-detail-pagination-link-next" href={`/posts/${nextPost.slug}`}>
          <span className="post-detail-pagination-label">Next</span>
          <span className="row-title">{nextPost.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}

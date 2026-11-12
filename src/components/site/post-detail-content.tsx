import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

import { MarkdownExport } from '@/components/site/markdown-export'
import { ContentRenderer } from '@/components/site/content-renderer'
import { PostDates } from '@/components/site/post-dates'
import { Link } from '@/i18n/navigation'
import { getPostLastModifiedDate } from '@/lib/post-dates'
import { getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post } from '@/payload-types'

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export async function PostDetailHeader(props: { post: Post }) {
  const { post } = props
  const t = await getTranslations('post')
  const locale = await getLocale()
  const metaLine = [
    getPostCategoryLabel(post.postCategory),
    post.readingTime ? t('readingTime', { minutes: post.readingTime }) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <header className="post-detail-header">
      {metaLine ? <p className="post-detail-label">{metaLine}</p> : null}
      <h1>{post.title}</h1>
      <p className="lede">{post.description}</p>
      <PostDates
        locale={locale}
        modifiedAt={getPostLastModifiedDate(post).toISOString()}
        publishedAt={post.publishedAt}
        publishedText={(date) => t('publishedOn', { date })}
        updatedText={(date) => t('updatedOn', { date })}
      />
      <MarkdownExport kind="posts" slug={post.slug} />
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

export async function PostDetailPagination(props: {
  nextPost: Post | null
  previousPost: Post | null
}) {
  const { nextPost, previousPost } = props
  if (!nextPost && !previousPost) return null
  const [t, common] = await Promise.all([
    getTranslations('post'),
    getTranslations('common'),
  ])
  return (
    <nav aria-label={t('postPagination')} className="contact-links">
      {previousPost ? (
        <Link href={`/posts/${previousPost.slug}`}>{common('previousPost')} →</Link>
      ) : null}
      {nextPost ? <Link href={`/posts/${nextPost.slug}`}>{common('nextPost')} →</Link> : null}
    </nav>
  )
}

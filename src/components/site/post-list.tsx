import Image from 'next/image'
import Link from 'next/link'

import { formatPostDate, formatPostMeta } from '@/lib/posts-index'
import type { Post } from '@/payload-types'

type PostImage = {
  alt?: null | string
  height?: null | number
  url?: null | string
  width?: null | number
}

type ReadyPostImage = {
  alt?: null | string
  height?: null | number
  url: string
  width?: null | number
}

export type PostListEntry = {
  description?: Post['description']
  id: Post['id']
  language: Post['language']
  postCategory: null | Post['postCategory']
  publishedAt?: Post['publishedAt']
  readingTime?: Post['readingTime']
  slug: Post['slug']
  title: Post['title']
  previewImage?: null | number | PostImage
}

function getPostImage(image: PostListEntry['previewImage']): null | ReadyPostImage {
  if (typeof image === 'object' && image !== null && typeof image.url === 'string' && image.url) {
    return {
      alt: image.alt,
      height: image.height,
      url: image.url,
      width: image.width,
    }
  }

  return null
}

type PostListPresentation = 'compact' | 'default'

export function PostListItem<T extends PostListEntry>(props: {
  item: T
  presentation?: PostListPresentation
  showImages?: boolean
}) {
  const { item, presentation = 'default', showImages = true } = props
  const image = showImages ? getPostImage(item.previewImage) : null

  if (presentation === 'compact') {
    const date = formatPostDate(item.publishedAt)

    return (
      <Link className="post-item post-item--compact" href={`/posts/${item.slug}`}>
        <span className="post-title">{item.title}</span>
        {date ? <span className="post-meta post-meta--compact">{date}</span> : null}
      </Link>
    )
  }

  return (
    <Link className="post-item" href={`/posts/${item.slug}`}>
      {showImages ? (
        image ? (
          <Image
            alt={image.alt || item.title}
            className="post-preview"
            height={image.height || 86}
            src={image.url}
            width={image.width || 128}
          />
        ) : (
          <span aria-hidden="true" className="post-preview post-preview-placeholder" />
        )
      ) : null}

      <span>
        <span className="post-title">{item.title}</span>
        {item.description ? <span className="post-desc">{item.description}</span> : null}
      </span>

      <span className="post-meta">{formatPostMeta(item)}</span>
    </Link>
  )
}

export function PostList<T extends PostListEntry>(props: {
  items: T[]
  presentation?: PostListPresentation
  showImages?: boolean
}) {
  const { items, presentation = 'default', showImages = true } = props

  return (
    <div className="post-list">
      {items.map((item) => (
        <PostListItem item={item} key={item.id} presentation={presentation} showImages={showImages} />
      ))}
    </div>
  )
}

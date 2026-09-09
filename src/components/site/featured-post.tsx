import { getLocale } from 'next-intl/server'
import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import { formatPostDate, getPostCategoryLabel } from '@/lib/posts-index'
import type { Media, Post, PostCategory } from '@/payload-types'

export type FeaturedPostEntry = {
  coverImage?: Media | null
  description?: Post['description']
  id: Post['id']
  postCategory: null | PostCategory
  previewImage?: Media | null
  publishedAt?: Post['publishedAt']
  slug: Post['slug']
  title: Post['title']
}

export async function FeaturedPost(props: { post: FeaturedPostEntry }) {
  const { post } = props
  const image = post.coverImage || post.previewImage
  const category = getPostCategoryLabel(post.postCategory)
  const locale = await getLocale()
  const date = formatPostDate(post.publishedAt, locale)

  return (
    <Link className="featured" href={`/posts/${post.slug}`}>
      <div>
        <h3 className="featured-title">{post.title}</h3>

        {post.description ? <p className="featured-desc">{post.description}</p> : null}

        <div className="featured-meta">
          {category ? <span>{category}</span> : null}
          {date ? <span>{date}</span> : null}
        </div>
      </div>

      {image?.url ? (
        <Image
          alt={image.alt || post.title}
          className="featured-image"
          height={image.height || 180}
          src={image.url}
          width={image.width || 260}
        />
      ) : (
        <span aria-hidden="true" className="featured-image post-preview-placeholder" />
      )}
    </Link>
  )
}

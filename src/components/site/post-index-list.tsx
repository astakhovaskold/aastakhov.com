import Image from 'next/image'
import Link from 'next/link'

import {
  formatPostMeta,
  type PostCategoryLink,
  type PostListItem,
} from '@/lib/posts-index'

function isActiveCategory(currentSlug: null | string, linkSlug: string): boolean {
  return currentSlug === linkSlug
}

export function PostCategoryNav(props: {
  categoryLinks: PostCategoryLink[]
  currentSlug?: null | string
}) {
  const { categoryLinks, currentSlug = null } = props

  return (
    <nav className="post-category-nav" aria-label="Post categories">
      <Link
        aria-current={currentSlug === null ? 'page' : undefined}
        className="post-category-link"
        href="/posts"
      >
        All
      </Link>

      {categoryLinks.map((link) => (
        <Link
          aria-current={isActiveCategory(currentSlug, link.slug) ? 'page' : undefined}
          className="post-category-link"
          href={link.href}
          key={link.id}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export function PostIndexList(props: { items: PostListItem[] }) {
  const { items } = props

  return (
    <div className="post-list">
      {items.map((post) => {
        const image = post.previewImage?.url
          ? {
              alt: post.previewImage.alt || post.title,
              height: post.previewImage.height || 86,
              src: post.previewImage.url,
              width: post.previewImage.width || 128,
            }
          : null

        return (
          <Link className="post-item" href={`/posts/${post.slug}`} key={post.id}>
            {image ? (
              <Image
                alt={image.alt}
                className="post-preview"
                height={image.height}
                src={image.src}
                width={image.width}
              />
            ) : (
              <span aria-hidden="true" className="post-preview post-preview-placeholder" />
            )}

            <span>
              <span className="post-title">{post.title}</span>
              <span className="post-desc">{post.description}</span>
            </span>

            <span className="post-meta">{formatPostMeta(post)}</span>
          </Link>
        )
      })}
    </div>
  )
}

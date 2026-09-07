import { getTranslations } from 'next-intl/server'

import { ArrowLink } from '@/components/site/arrow-link'
import type { PostCategoryLink, PostListItem as PostListEntry } from '@/lib/posts-index'
import { PostList } from '@/components/site/post-list'

function isActiveCategory(currentSlug: null | string, linkSlug: string): boolean {
  return currentSlug === linkSlug
}

export async function PostCategoryNav(props: {
  categoryLinks: PostCategoryLink[]
  currentSlug?: null | string
}) {
  const { categoryLinks, currentSlug = null } = props
  const t = await getTranslations('common')

  return (
    <nav className="post-category-nav" aria-label={t('topics')}>
      <ArrowLink
        ariaCurrent={currentSlug === null ? 'page' : undefined}
        className="post-category-link"
        href="/posts"
      >
        {t('all')}
      </ArrowLink>

      {categoryLinks.map((link) => (
        <ArrowLink
          ariaCurrent={isActiveCategory(currentSlug, link.slug) ? 'page' : undefined}
          className="post-category-link"
          href={link.href}
          key={link.id}
        >
          {link.label}
        </ArrowLink>
      ))}
    </nav>
  )
}

export function PostIndexList(props: { items: PostListEntry[] }) {
  return <PostList items={props.items} />
}

import { Link } from '@/i18n/navigation'
import type { OpenSource } from '@/payload-types'

function isInternalHref(href: string): boolean {
  return href.startsWith('/')
}

export type OpenSourceListEntry = Pick<
  OpenSource,
  'articleUrl' | 'description' | 'githubUrl' | 'id' | 'name' | 'stars'
>

export function OpenSourceListItem(props: { item: OpenSourceListEntry }) {
  const { item } = props
  const href = item.articleUrl || item.githubUrl

  if (!href) {
    return null
  }

  const content = (
    <>
      <span>
        <span className="oss-title">{item.name}</span>
        {item.description ? <span className="oss-desc">{item.description}</span> : null}
      </span>
      <span className="oss-meta">{item.stars ? `${item.stars} stars` : 'GitHub'}</span>
    </>
  )

  return isInternalHref(href) ? (
    <Link className="oss-item" href={href}>
      {content}
    </Link>
  ) : (
    <a className="oss-item" href={href}>
      {content}
    </a>
  )
}

export function OpenSourceList(props: { items: OpenSourceListEntry[] }) {
  const { items } = props

  return (
    <div className="oss-list">
      {items.map((item) => (
        <OpenSourceListItem item={item} key={item.id} />
      ))}
    </div>
  )
}

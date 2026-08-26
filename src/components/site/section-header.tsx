import Link from 'next/link'
import type { ReactNode } from 'react'

function isInternalHref(href: string): boolean {
  return href.startsWith('/')
}

type SectionHeaderAction =
  | {
      href: string
      label: string
    }
  | ReactNode

export function SectionHeader(props: {
  action?: SectionHeaderAction
  title: string
}) {
  const { action, title } = props

  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {typeof action === 'object' && action !== null && 'href' in action ? (
        isInternalHref(action.href) ? (
          <Link className="section-link" href={action.href}>
            {action.label}
          </Link>
        ) : (
          <a className="section-link" href={action.href}>
            {action.label}
          </a>
        )
      ) : action ? (
        action
      ) : null}
    </div>
  )
}

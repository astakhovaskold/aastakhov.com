import type { ReactNode } from 'react'

import { ArrowLink } from '@/components/site/arrow-link'

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
        <ArrowLink className="section-link" href={action.href}>
          {action.label}
        </ArrowLink>
      ) : action ? (
        action
      ) : null}
    </div>
  )
}

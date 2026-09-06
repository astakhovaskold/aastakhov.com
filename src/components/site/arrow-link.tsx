import type { ReactNode } from 'react'

import { AnalyticsLink } from '@/components/site/analytics-link'
import type { AnalyticsEvent } from '@/lib/analytics'

export function ArrowLink(props: {
  ariaCurrent?: 'page'
  children: ReactNode
  className?: string
  href: string
  rel?: string
  target?: string
  trackingEvent?: AnalyticsEvent
}) {
  const { ariaCurrent, children, className, href, rel, target, trackingEvent } = props

  return (
    <AnalyticsLink
      ariaCurrent={ariaCurrent}
      className={className}
      href={href}
      rel={rel}
      target={target}
      trackingEvent={trackingEvent}
    >
      {children} →
    </AnalyticsLink>
  )
}

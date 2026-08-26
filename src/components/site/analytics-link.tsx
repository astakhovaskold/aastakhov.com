'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { track, type AnalyticsEvent } from '@/lib/analytics'

function isInternalHref(href: string): boolean {
  return href.startsWith('/')
}

export function AnalyticsLink(props: {
  children: ReactNode
  className?: string
  href: string
  rel?: string
  target?: string
  trackingEvent?: AnalyticsEvent
}) {
  const { children, className, href, rel, target, trackingEvent } = props
  const handleClick = () => {
    if (trackingEvent) {
      track(trackingEvent)
    }
  }

  if (isInternalHref(href)) {
    return (
      <Link className={className} href={href} onClick={handleClick}>
        {children}
      </Link>
    )
  }

  return (
    <a className={className} href={href} onClick={handleClick} rel={rel} target={target}>
      {children}
    </a>
  )
}

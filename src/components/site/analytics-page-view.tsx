'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { analyticsEventNames, track, type AnalyticsEvent } from '@/lib/analytics'

function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getDetailPage(pathname: string): { event: AnalyticsEvent; slug: string } | null {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length !== 2 || !segments[1]) {
    return null
  }

  if (segments[0] === 'projects') {
    return { event: analyticsEventNames.projectView, slug: decodeSlug(segments[1]) }
  }

  if (segments[0] === 'posts') {
    return { event: analyticsEventNames.postView, slug: decodeSlug(segments[1]) }
  }

  return null
}

export function AnalyticsPageView() {
  const pathname = usePathname()
  const lastTrackedPage = useRef<string | null>(null)

  useEffect(() => {
    const detailPage = getDetailPage(pathname)

    if (!detailPage) {
      return
    }

    const trackingKey = `${detailPage.event}:${detailPage.slug}`

    if (lastTrackedPage.current === trackingKey) {
      return
    }

    lastTrackedPage.current = trackingKey
    track(detailPage.event, { slug: detailPage.slug })
  }, [pathname])

  return null
}

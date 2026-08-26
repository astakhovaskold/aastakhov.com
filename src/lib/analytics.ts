export const analyticsEventNames = {
  bookingClick: 'booking_click',
  cvDownload: 'cv_download',
  emailClick: 'email_click',
  postView: 'post_view',
  projectView: 'project_view',
  telegramClick: 'telegram_click',
} as const

export type AnalyticsEvent = (typeof analyticsEventNames)[keyof typeof analyticsEventNames]
export type AnalyticsProperties = Record<string, boolean | number | string>

export type AnalyticsAdapter = {
  track: (event: AnalyticsEvent, properties?: AnalyticsProperties) => void
}

export type UmamiConfig = {
  url: string
  websiteId: string
}

const DEFAULT_UMAMI_URL = 'https://umami.aastakhov.com'
const DEFAULT_UMAMI_WEBSITE_ID = '513ae87a-25e9-4000-b143-c08d205c27e1'

const noopAdapter: AnalyticsAdapter = {
  track: () => undefined,
}

declare global {
  interface Window {
    umami?: {
      track: (event: string, properties?: AnalyticsProperties) => void
    }
  }
}

/**
 * Tracking plan:
 * - telegram_click / email_click / booking_click: link activation; no properties.
 * - cv_download: CV PDF link activation; no properties.
 * - project_view / post_view: detail page view; `slug` identifies the public content item.
 * Slugs are public content identifiers and no user or contact data is sent.
 */
export function getContactLinkEvent(label: string, href: string): AnalyticsEvent | undefined {
  const normalizedLabel = label.trim().toLowerCase()

  if (normalizedLabel === 'telegram') {
    return analyticsEventNames.telegramClick
  }

  if (normalizedLabel === 'email' || href.toLowerCase().startsWith('mailto:')) {
    return analyticsEventNames.emailClick
  }

  if (normalizedLabel.includes('book') || normalizedLabel.includes('call')) {
    return analyticsEventNames.bookingClick
  }

  return undefined
}

export function getUmamiConfig(): UmamiConfig | null {
  if (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.trim().toLowerCase() !== 'umami') {
    return null
  }

  const url = process.env.NEXT_PUBLIC_UMAMI_URL?.trim() || DEFAULT_UMAMI_URL
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim() || DEFAULT_UMAMI_WEBSITE_ID

  try {
    const parsedUrl = new URL(url)

    if (!['http:', 'https:'].includes(parsedUrl.protocol) || !websiteId) {
      return null
    }

    return {
      url: parsedUrl.toString().replace(/\/$/, ''),
      websiteId,
    }
  } catch {
    return null
  }
}

export function createUmamiAdapter(): AnalyticsAdapter {
  return {
    track: (event, properties) => {
      try {
        if (
          typeof window === 'undefined' ||
          !getUmamiConfig() ||
          typeof window.umami?.track !== 'function'
        ) {
          return
        }

        window.umami.track(event, properties)
      } catch {
        // Analytics must never affect the page or navigation.
      }
    },
  }
}

export function getAnalyticsAdapter(): AnalyticsAdapter {
  return getUmamiConfig() ? createUmamiAdapter() : noopAdapter
}

export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  getAnalyticsAdapter().track(event, properties)
}

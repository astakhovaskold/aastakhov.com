import { hasLocale } from 'next-intl'

import { routing } from '@/i18n/routing'
import { buildFeedResponse, type FeedLocale } from '@/lib/feed-response'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    return new Response('Not found', { status: 404 })
  }

  return buildFeedResponse(locale as FeedLocale)
}

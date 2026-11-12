import { buildFeedResponse } from '@/lib/feed-response'

export const dynamic = 'force-dynamic'

/** The default-locale feed. Localized feeds live at /ru/feed.xml and /en/feed.xml. */
export async function GET() {
  return buildFeedResponse('ru')
}

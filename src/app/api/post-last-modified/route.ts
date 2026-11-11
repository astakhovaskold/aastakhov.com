import { type NextRequest, NextResponse } from 'next/server'

import { getPostLastModifiedBySlug } from '@/lib/post-detail'
import { getLatestPostsLastModifiedDate } from '@/lib/posts-index'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const slug = searchParams.get('slug')
  const locale = searchParams.get('locale') || 'ru'

  if (slug) {
    const lastModified = await getPostLastModifiedBySlug(slug, locale)
    if (!lastModified) {
      return new NextResponse(null, { status: 404 })
    }

    return NextResponse.json(
      { lastModified: lastModified.toISOString() },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      },
    )
  }

  const latestDate = await getLatestPostsLastModifiedDate(locale)
  if (!latestDate) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.json(
    { lastModified: latestDate.toISOString() },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}

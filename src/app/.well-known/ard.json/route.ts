import { buildArdManifest } from '@/lib/ard'
import { getSiteUrl } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(buildArdManifest(getSiteUrl()), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  })
}

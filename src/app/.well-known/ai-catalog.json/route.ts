import { buildLegacyAiCatalog } from '@/lib/ard'
import { getSiteUrl } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

// Deprecated location kept for older consumers; `/.well-known/ard.json` is the primary one.
export function GET() {
  return Response.json(buildLegacyAiCatalog(getSiteUrl()), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  })
}

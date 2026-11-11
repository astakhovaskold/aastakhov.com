import type { MetadataRoute } from 'next'

import { getPublicSitemap } from '@/lib/sitemap'

// Data helpers return [] during `next build`, so a statically prerendered sitemap would
// be baked empty and ISR did not refresh it. Render on request until page caching with
// on-demand revalidation (tasks 4.3 and 5.x) is in place.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getPublicSitemap()
}

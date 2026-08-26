import type { MetadataRoute } from 'next'

import { buildSitemapUrl, getPublicSitemapPaths } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getPublicSitemapPaths()

  return paths.map((path) => ({
    url: buildSitemapUrl(path),
  }))
}

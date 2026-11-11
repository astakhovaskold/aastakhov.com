import type { MetadataRoute } from 'next'

import { getPublicSitemap } from '@/lib/sitemap'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getPublicSitemap()
}

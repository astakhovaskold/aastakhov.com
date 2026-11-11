import type { MetadataRoute } from 'next'

import { getSiteUrl, getPublicSitemapEntries } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPublicSitemapEntries()
  const siteUrl = getSiteUrl()

  return entries.map((entry) => ({
    url: `${siteUrl}/ru${entry.path}`,
    lastModified: entry.lastModified,
    alternates: {
      languages: {
        ru: `${siteUrl}/ru${entry.path}`,
        en: `${siteUrl}/en${entry.path}`,
      },
    },
  }))
}

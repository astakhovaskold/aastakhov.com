import type { MetadataRoute } from 'next'

import { getSiteUrl, getPublicSitemapPaths } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getPublicSitemapPaths()
  const siteUrl = getSiteUrl()

  return paths.map((path) => ({
    url: `${siteUrl}/ru${path}`,
    alternates: {
      languages: {
        ru: `${siteUrl}/ru${path}`,
        en: `${siteUrl}/en${path}`,
      },
    },
  }))
}

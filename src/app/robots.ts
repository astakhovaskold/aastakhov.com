import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/sitemap'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/preview', '/draft'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}

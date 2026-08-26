import type { Metadata } from 'next'

import type { PublicSiteSettings } from '@/lib/siteSettings'

const FALLBACK_SITE_URL = 'http://localhost:3000'
const FALLBACK_OG_IMAGE = '/askold-avatar.jpeg'

type SeoFields = {
  title?: null | string
  description?: null | string
  image?: unknown
}

export type SeoEntity = {
  title?: null | string
  description?: null | string
  publishedAt?: null | string
  seo?: SeoFields
}

type CreateSeoMetadataOptions = {
  canonicalPath: string
  description?: null | string
  entity?: SeoEntity | null
  image?: unknown
  noindex?: boolean
  publishedTime?: null | string
  settings: PublicSiteSettings
  title?: null | string
  type?: 'article' | 'website'
}

type NotFoundMetadataOptions = {
  canonicalPath: string
  resource: string
  settings: PublicSiteSettings
}

function firstText(...values: Array<null | string | undefined>): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim()
}

function isHttpUrl(value: URL): boolean {
  return value.protocol === 'http:' || value.protocol === 'https:'
}

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!configuredUrl) {
    return new URL(FALLBACK_SITE_URL)
  }

  try {
    const url = new URL(configuredUrl)

    if (!isHttpUrl(url) || url.username || url.password) {
      return new URL(FALLBACK_SITE_URL)
    }

    url.search = ''
    url.hash = ''

    return url
  } catch {
    return new URL(FALLBACK_SITE_URL)
  }
}

export function absoluteSiteUrl(value: string): string {
  try {
    const url = new URL(value, getSiteUrl())

    return isHttpUrl(url) ? url.toString() : getSiteUrl().toString()
  } catch {
    return getSiteUrl().toString()
  }
}

function getMediaUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return absoluteSiteUrl(value.trim())
  }

  if (typeof value === 'object' && value !== null && 'url' in value) {
    const mediaUrl = value.url

    if (typeof mediaUrl === 'string' && mediaUrl.trim()) {
      return absoluteSiteUrl(mediaUrl.trim())
    }
  }

  return undefined
}

function getSeoImage(options: CreateSeoMetadataOptions): string {
  return (
    getMediaUrl(options.entity?.seo?.image) ||
    getMediaUrl(options.image) ||
    getMediaUrl(options.settings.seo.defaultImage) ||
    absoluteSiteUrl(FALLBACK_OG_IMAGE)
  )
}

export function createSeoMetadata(options: CreateSeoMetadataOptions): Metadata {
  const title =
    firstText(
      options.entity?.seo?.title,
      options.title,
      options.entity?.title,
      options.settings.seo.defaultTitle,
    ) || 'Askold Astakhov'
  const description =
    firstText(
      options.entity?.seo?.description,
      options.description,
      options.entity?.description,
      options.settings.seo.defaultDescription,
    ) || 'Personal site for Askold Astakhov.'
  const image = getSeoImage(options)
  const canonicalUrl = absoluteSiteUrl(options.canonicalPath)
  const openGraph = {
    description,
    images: [{ alt: title, url: image }],
    siteName: options.settings.name,
    title,
    type: options.type || ('website' as const),
    url: canonicalUrl,
    ...(options.type === 'article' && options.publishedTime
      ? { publishedTime: options.publishedTime }
      : {}),
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    description,
    openGraph,
    robots: options.noindex
      ? {
          follow: false,
          index: false,
        }
      : {
          follow: true,
          index: true,
        },
    title,
  }
}

export function createNotFoundMetadata(options: NotFoundMetadataOptions): Metadata {
  return createSeoMetadata({
    canonicalPath: options.canonicalPath,
    noindex: true,
    settings: options.settings,
    title: `${options.resource} not found`,
  })
}

export function isPubliclyIndexableEntity(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const entity = value as { _status?: unknown; publishedAt?: unknown }

  if (entity._status !== undefined && entity._status !== 'published') {
    return false
  }

  if ('publishedAt' in entity) {
    if (typeof entity.publishedAt !== 'string' || !entity.publishedAt) {
      return false
    }

    const publishedAt = new Date(entity.publishedAt)

    if (Number.isNaN(publishedAt.valueOf()) || publishedAt > new Date()) {
      return false
    }
  }

  return true
}

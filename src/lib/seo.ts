import type { Metadata } from 'next'

import type { PublicSiteSettings } from '@/lib/siteSettings'

const FALLBACK_SITE_URL = 'http://localhost:3000'
export type SeoEntity = {
  title?: null | string
  description?: null | string
  publishedAt?: null | string
}

type CreateSeoMetadataOptions = {
  canonicalPath: string
  description?: null | string
  entity?: SeoEntity | null
  locale: 'ru' | 'en'
  noindex?: boolean
  publishedTime?: null | string
  modifiedTime?: null | string
  settings: PublicSiteSettings
  title?: null | string
  type?: 'article' | 'website'
}

type NotFoundMetadataOptions = {
  canonicalPath?: string
  locale?: 'ru' | 'en'
  resource?: string
  settings?: PublicSiteSettings
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

export function pageUrl(locale: string, path: string = ''): string {
  const cleanPath = path.replace(/^\/+|\/+$/g, '')
  const localizedPath = cleanPath.length > 0 ? `/${locale}/${cleanPath}` : `/${locale}`
  return absoluteSiteUrl(localizedPath)
}

export function createSeoMetadata(options: CreateSeoMetadataOptions): Metadata {
  const isRu = options.locale === 'ru'
  const fallbackTitle = isRu ? 'Аскольд Астахов' : 'Askold Astakhov'
  const fallbackDescription = isRu
    ? 'Личный сайт Аскольда Астахова.'
    : 'Personal site for Askold Astakhov.'

  const title =
    firstText(
      options.title,
      options.entity?.title,
      options.settings.seo.defaultTitle,
    ) || fallbackTitle
  const description =
    firstText(
      options.description,
      options.entity?.description,
      options.settings.seo.defaultDescription,
    ) || fallbackDescription
  const canonicalUrl = pageUrl(options.locale, options.canonicalPath)
  const openGraph = {
    description,
    siteName: options.settings.name,
    title,
    type: options.type || ('website' as const),
    url: canonicalUrl,
    ...(options.type === 'article' && (options.publishedTime || options.modifiedTime)
      ? {
          ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
          ...(options.modifiedTime ? { modifiedTime: options.modifiedTime } : {}),
        }
      : {}),
  }

  const otherMeta: Record<string, string> = {}
  if (options.modifiedTime) {
    const modDate = new Date(options.modifiedTime)
    if (!Number.isNaN(modDate.valueOf())) {
      otherMeta['Last-Modified'] = modDate.toUTCString()
    }
  }

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ru: pageUrl('ru', options.canonicalPath),
        en: pageUrl('en', options.canonicalPath),
        'x-default': pageUrl('en', options.canonicalPath),
      },
    },
    description,
    openGraph,
    ...(Object.keys(otherMeta).length > 0 ? { other: otherMeta } : {}),
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
    twitter: {
      card: 'summary_large_image',
      description,
      title,
    },
  }
}

export function createNotFoundMetadata(options?: NotFoundMetadataOptions): Metadata {
  return {
    robots: {
      follow: false,
      index: false,
    },
    title: options?.resource ? `${options.resource} not found` : 'Not Found',
  }
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

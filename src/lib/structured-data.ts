import { breadcrumbList, listItem, person } from 'ld-generator'

import { absoluteSiteUrl } from '@/lib/seo'
import type { PublicSiteSettings } from '@/lib/siteSettings'

export type JsonLd = Record<string, unknown>
export type Locale = 'en' | 'ru'

type BreadcrumbItem = {
  name: string
  path: string
}

type ContentSchemaInput = {
  description: string
  locale: Locale
  path: string
  publishedAt?: null | string
  title: string
}

export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function createPersonSchema(settings: PublicSiteSettings): JsonLd {
  const profiles = [settings.linkedin, settings.github, settings.telegram].filter(
    (value): value is string => Boolean(value),
  )

  return {
    ...person({ name: settings.name }),
    email: `mailto:${settings.email}`,
    sameAs: profiles.length ? profiles : undefined,
    url: absoluteSiteUrl('/'),
  }
}

export function createWebsiteSchema(settings: PublicSiteSettings, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    description: settings.seo.defaultDescription,
    inLanguage: locale,
    name: settings.name,
    url: absoluteSiteUrl(`/${locale}`),
  }
}

export function createBreadcrumbSchema(locale: Locale, items: BreadcrumbItem[]): JsonLd {
  return breadcrumbList({
    '@context': 'https://schema.org',
    itemListElement: items.map((item, index) =>
      listItem({
        item: {
          '@id': absoluteSiteUrl(`/${locale}${item.path}`),
          name: item.name,
        },
        position: index + 1,
      }),
    ),
  }) as unknown as JsonLd
}

export function createArticleSchema(input: ContentSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: 'Askold Astakhov',
    },
    datePublished: input.publishedAt || undefined,
    description: input.description,
    headline: input.title,
    inLanguage: input.locale,
    mainEntityOfPage: absoluteSiteUrl(`/${input.locale}${input.path}`),
  }
}

export function createCreativeWorkSchema(input: ContentSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    author: {
      '@type': 'Person',
      name: 'Askold Astakhov',
    },
    datePublished: input.publishedAt || undefined,
    description: input.description,
    inLanguage: input.locale,
    name: input.title,
    url: absoluteSiteUrl(`/${input.locale}${input.path}`),
  }
}

export function createProfilePageSchema(input: ContentSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    description: input.description,
    inLanguage: input.locale,
    mainEntity: {
      '@type': 'Person',
      name: input.title,
    },
    url: absoluteSiteUrl(`/${input.locale}${input.path}`),
  }
}

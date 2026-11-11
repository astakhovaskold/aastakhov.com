import { absoluteSiteUrl, pageUrl } from '@/lib/seo'
import type { PublicSiteSettings } from '@/lib/siteSettings'

export type JsonLd = Record<string, unknown>
export type Locale = 'en' | 'ru'

type BreadcrumbItem = {
  name: string
  path: string
}

type ContentSchemaInput = {
  dateModified?: null | string
  description: string
  image?: null | string
  locale: Locale
  path: string
  publishedAt?: null | string
  title: string
}

export type ItemListEntry = {
  name: string
  path: string
}

const SCHEMA_CONTEXT = 'https://schema.org'

const crumbNames: Record<Locale, { cv: string; home: string }> = {
  en: { cv: 'CV', home: 'Home' },
  ru: { cv: 'Резюме', home: 'Главная' },
}

export function breadcrumbName(locale: Locale, key: 'cv' | 'home'): string {
  return crumbNames[locale][key]
}

export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function personId(): string {
  return `${absoluteSiteUrl('/')}#person`
}

export function websiteId(): string {
  return `${absoluteSiteUrl('/')}#website`
}

function personRef(): JsonLd {
  return { '@id': personId() }
}

function definedEntries(value: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === '') return false
      if (Array.isArray(entry) && entry.length === 0) return false
      return true
    }),
  )
}

function createPersonSchema(settings: PublicSiteSettings, locale: Locale): JsonLd {
  const sameAs = [settings.linkedin, settings.github, settings.telegram, settings.devto].filter(
    (value): value is string => Boolean(value),
  )

  return definedEntries({
    '@id': personId(),
    '@type': 'Person',
    alternateName: settings.alternateName,
    description: settings.description,
    homeLocation: settings.homeLocation ? { '@type': 'Place', name: settings.homeLocation } : undefined,
    image: settings.imageUrl ? absoluteSiteUrl(settings.imageUrl) : undefined,
    jobTitle: settings.jobTitle,
    knowsAbout: settings.knowsAbout,
    name: settings.name,
    sameAs,
    url: pageUrl(locale),
  })
}

function createWebsiteSchema(settings: PublicSiteSettings): JsonLd {
  return definedEntries({
    '@id': websiteId(),
    '@type': 'WebSite',
    description: settings.seo.defaultDescription,
    inLanguage: ['ru', 'en'],
    name: settings.name,
    publisher: personRef(),
    url: absoluteSiteUrl('/'),
  })
}

export function createSiteGraph(settings: PublicSiteSettings, locale: Locale): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [createPersonSchema(settings, locale), createWebsiteSchema(settings)],
  }
}

export function createBreadcrumbSchema(locale: Locale, items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: pageUrl(locale, item.path),
      name: item.name,
      position: index + 1,
    })),
  }
}

export function createBlogPostingSchema(input: ContentSchemaInput): JsonLd {
  const url = pageUrl(input.locale, input.path)

  return definedEntries({
    '@context': SCHEMA_CONTEXT,
    '@type': 'BlogPosting',
    author: personRef(),
    dateModified: input.dateModified || input.publishedAt || undefined,
    datePublished: input.publishedAt || undefined,
    description: input.description,
    headline: input.title,
    image: input.image ? absoluteSiteUrl(input.image) : undefined,
    inLanguage: input.locale,
    mainEntityOfPage: { '@id': url, '@type': 'WebPage' },
    publisher: personRef(),
  })
}

export function createCreativeWorkSchema(input: ContentSchemaInput): JsonLd {
  return definedEntries({
    '@context': SCHEMA_CONTEXT,
    '@type': 'CreativeWork',
    author: personRef(),
    dateModified: input.dateModified || undefined,
    datePublished: input.publishedAt || undefined,
    description: input.description,
    image: input.image ? absoluteSiteUrl(input.image) : undefined,
    inLanguage: input.locale,
    name: input.title,
    url: pageUrl(input.locale, input.path),
  })
}

export function createProfilePageSchema(input: ContentSchemaInput): JsonLd {
  return definedEntries({
    '@context': SCHEMA_CONTEXT,
    '@type': 'ProfilePage',
    dateModified: input.dateModified || undefined,
    description: input.description,
    inLanguage: input.locale,
    mainEntity: personRef(),
    name: input.title,
    url: pageUrl(input.locale, input.path),
  })
}

export function createCollectionPageSchema(
  input: {
    description: string
    items: ItemListEntry[]
    locale: Locale
    path: string
    title: string
    type?: 'Blog' | 'CollectionPage'
  },
): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': input.type ?? 'CollectionPage',
    description: input.description,
    inLanguage: input.locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem',
        name: item.name,
        position: index + 1,
        url: pageUrl(input.locale, item.path),
      })),
      numberOfItems: input.items.length,
    },
    name: input.title,
    url: pageUrl(input.locale, input.path),
  }
}

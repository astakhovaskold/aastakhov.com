import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import { AnalyticsPageView } from '@/components/site/analytics-page-view'
import { StructuredData } from '@/components/site/structured-data'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getUmamiConfig } from '@/lib/analytics'
import { createSeoMetadata, getSiteUrl } from '@/lib/seo'
import { FEATURES } from '@/lib/feature-flags'
import { getSiteSettings } from '@/lib/siteSettings'
import { createPersonSchema, createWebsiteSchema } from '@/lib/structured-data'
import './styles.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const settings = await getSiteSettings(locale)

  return {
    ...createSeoMetadata({
      canonicalPath: '/',
      description: settings.seo.defaultDescription,
      locale: locale as 'ru' | 'en',
      settings,
      title: settings.seo.defaultTitle,
    }),
    metadataBase: getSiteUrl(),
    manifest: '/favicon/manifest.json',
    icons: {
      icon: [
        { url: '/favicon/favicon.ico', sizes: 'any' },
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [
        { url: '/favicon/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
        { url: '/favicon/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
        { url: '/favicon/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
        { url: '/favicon/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
        { url: '/favicon/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
        { url: '/favicon/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
        { url: '/favicon/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
        { url: '/favicon/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
        { url: '/favicon/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    other: {
      'msapplication-TileColor': '#ffffff',
      'msapplication-TileImage': '/favicon/ms-icon-144x144.png',
    },
  }
}

export default async function RootLayout(props: LocaleLayoutProps) {
  const { children } = props
  const { locale } = await props.params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [settings, t] = await Promise.all([getSiteSettings(locale), getTranslations('nav')])
  const footerT = await getTranslations('footer')
  const umamiConfig = getUmamiConfig()

  return (
    <html lang={locale}>
      <body>
        <StructuredData data={[createPersonSchema(settings), createWebsiteSchema(settings, locale)]} />
        <NextIntlClientProvider>
          {umamiConfig ? (
            <Script
              data-auto-track="false"
              data-website-id={umamiConfig.websiteId}
              id="umami-analytics"
              src={`${umamiConfig.url}/script.js`}
              strategy="afterInteractive"
            />
          ) : null}
          <AnalyticsPageView />
          <div className="site">
            <header className="site-header">
              <Link className="site-name" href="/">
                {settings.name}
              </Link>

              <nav className="site-nav" aria-label={t('mainNavigation')}>
                {FEATURES.projects ? <Link href="/projects">{t('projects')}</Link> : null}
                <Link href="/posts">{t('posts')}</Link>
                <Link href="/cv">{t('cv')}</Link>
              </nav>
            </header>

            <main className="site-main">{children}</main>

            <footer className="site-footer">
              <span>{footerT('copyright', { name: settings.name })}</span>
              <span>{footerT('tagline')}</span>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

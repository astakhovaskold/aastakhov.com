import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import { AnalyticsPageView } from '@/components/site/analytics-page-view'
import { StructuredData } from '@/components/site/structured-data'
import { WebMcpProvider } from '@/components/webmcp/WebMcpProvider'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getUmamiConfig } from '@/lib/analytics'
import { getSiteUrl } from '@/lib/seo'
import { buildNavItems, getNavigationCounts } from '@/lib/navigation'
import { getSiteSettings } from '@/lib/siteSettings'
import { createSiteGraph } from '@/lib/structured-data'
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
    metadataBase: getSiteUrl(),
    title: {
      default: settings.seo.defaultTitle || settings.name,
      template: `%s — ${settings.name}`,
    },
    description: settings.seo.defaultDescription,
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
      'model-context': '/api/mcp',
      'webmcp-endpoint': '/api/webmcp/search',
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

  const [settings, t, navCounts] = await Promise.all([
    getSiteSettings(locale),
    getTranslations('nav'),
    getNavigationCounts(locale),
  ])
  const navItems = buildNavItems(navCounts)
  const footerT = await getTranslations('footer')
  const umamiConfig = getUmamiConfig()

  return (
    <html lang={locale}>
      <head>
        <link rel="model-context" href="/api/mcp" />
        <link rel="webmcp" href="/api/webmcp/search" />
      </head>
      <body>
        <WebMcpProvider locale={locale} />
        <StructuredData data={createSiteGraph(settings, locale as 'en' | 'ru')} />
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

              <nav
                className="site-nav"
                aria-label={t('mainNavigation')}
                data-toolname="site_navigation"
                data-tooldescription="Site section navigation for posts, projects, and CV"
              >
                {navItems.map((item) => (
                  <Link href={item.href} key={item.key}>
                    {t(item.key)}
                  </Link>
                ))}
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

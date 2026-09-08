import type { Metadata } from 'next'
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

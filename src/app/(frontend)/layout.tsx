import Link from 'next/link'
import type { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'

import { AnalyticsPageView } from '@/components/site/analytics-page-view'
import { getUmamiConfig } from '@/lib/analytics'
import { createSeoMetadata, getSiteUrl } from '@/lib/seo'
import { FEATURES } from '@/lib/feature-flags'
import { getSiteSettings } from '@/lib/siteSettings'
import './styles.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    ...createSeoMetadata({
      canonicalPath: '/',
      description: settings.seo.defaultDescription,
      settings,
      title: settings.seo.defaultTitle,
    }),
    metadataBase: getSiteUrl(),
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const settings = await getSiteSettings()
  const umamiConfig = getUmamiConfig()

  return (
    <html lang="en">
      <body>
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

            <nav className="site-nav" aria-label="Main navigation">
              {FEATURES.projects ? <Link href="/projects">Projects</Link> : null}
              <Link href="/posts">Posts</Link>
              <Link href="/cv">CV</Link>
            </nav>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            <span>(c) 2026 {settings.name}</span>
            <span>Personal website</span>
          </footer>
        </div>
      </body>
    </html>
  )
}

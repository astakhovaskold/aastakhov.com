import Link from 'next/link'
import type { Metadata } from 'next'
import React from 'react'
import { getSiteSettings } from '@/lib/siteSettings'
import './styles.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    description: settings.seo.defaultDescription,
    title: settings.seo.defaultTitle,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const settings = await getSiteSettings()

  return (
    <html lang="en">
      <body>
        <div className="site">
          <header className="site-header">
            <Link className="site-name" href="/">
              {settings.name}
            </Link>

            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/projects">Projects</Link>
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

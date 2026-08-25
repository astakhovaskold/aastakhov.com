import Link from 'next/link'
import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Personal site for Askold Astakhov.',
  title: 'Askold Astakhov',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <div className="site">
          <header className="site-header">
            <Link className="site-name" href="/">
              Askold Astakhov
            </Link>

            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/projects">Projects</Link>
              <Link href="/posts">Posts</Link>
              <Link href="/cv">CV</Link>
              <a href="mailto:astakhovaskold@gmail.com">Contact</a>
            </nav>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            <span>(c) 2026 Askold Astakhov</span>
            <span>Personal website</span>
          </footer>
        </div>
      </body>
    </html>
  )
}

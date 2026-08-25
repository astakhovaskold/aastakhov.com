import React from 'react'

import { getSiteSettings } from '@/lib/siteSettings'
import './styles.css'

export default async function HomePage() {
  const settings = await getSiteSettings()
  const contactLinks = [
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    { href: `mailto:${settings.email}`, label: 'Email' },
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
    { href: '/cv', label: 'CV' },
  ].filter((link): link is { href: string; label: string } => Boolean(link))

  return (
    <>
      <section className="home">
        <p className="eyebrow">
          {settings.location} / {settings.availability}
        </p>
        <h1>Builder and technical partner.</h1>
        <p className="lede">
          I help turn complex product and engineering problems into pragmatic software:
          architecture, audits, implementation, and technical leadership.
        </p>
      </section>

      <section className="section" id="contact">
        <h2 className="section-title">Contacts</h2>
        <div className="contact-links">
          {contactLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

import type { PublicSiteSettings } from '@/lib/siteSettings'

export type PrimaryContact = {
  href: string
  kind: 'booking' | 'telegram'
}

/** The single primary contact action: the booking link when set, otherwise Telegram. */
export function getPrimaryContact(
  settings: Pick<PublicSiteSettings, 'bookingUrl' | 'telegram'>,
): null | PrimaryContact {
  if (settings.bookingUrl) return { href: settings.bookingUrl, kind: 'booking' }
  if (settings.telegram) return { href: settings.telegram, kind: 'telegram' }
  return null
}

export type ContactLink = {
  href: string
  label: string
}

/** Contact links in display order. The CV link is optional because only some pages show it. */
export function buildContactLinks(
  settings: Pick<PublicSiteSettings, 'bookingUrl' | 'email' | 'github' | 'linkedin' | 'telegram'>,
  options?: { includeCv?: boolean },
): ContactLink[] {
  const links: Array<ContactLink | null> = [
    settings.bookingUrl ? { href: settings.bookingUrl, label: 'Book a call' } : null,
    settings.telegram ? { href: settings.telegram, label: 'Telegram' } : null,
    settings.email ? { href: `mailto:${settings.email}`, label: 'Email' } : null,
    settings.linkedin ? { href: settings.linkedin, label: 'LinkedIn' } : null,
    settings.github ? { href: settings.github, label: 'GitHub' } : null,
    options?.includeCv ? { href: '/cv', label: 'CV' } : null,
  ]

  return links.filter((link): link is ContactLink => link !== null)
}

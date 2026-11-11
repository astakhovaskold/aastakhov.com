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

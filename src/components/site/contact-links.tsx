import { AnalyticsLink } from '@/components/site/analytics-link'
import { getContactLinkEvent } from '@/lib/analytics'

export type ContactLinkItem = {
  href: string
  label: string
}

export function ContactLinks(props: { links: ContactLinkItem[] }) {
  const { links } = props

  if (links.length === 0) {
    return null
  }

  return (
    <div className="contact-links">
      {links.map((link) => (
        <AnalyticsLink
          href={link.href}
          key={link.label}
          trackingEvent={getContactLinkEvent(link.label, link.href)}
        >
          {link.label} →
        </AnalyticsLink>
      ))}
    </div>
  )
}

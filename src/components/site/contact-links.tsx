import { ArrowLink } from '@/components/site/arrow-link'
import { analyticsEventNames, getContactLinkEvent } from '@/lib/analytics'

export type ContactLinkItem = {
  href: string
  kind?: 'booking'
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
        <ArrowLink
          href={link.href}
          key={link.label}
          trackingEvent={
            link.kind === 'booking'
              ? analyticsEventNames.bookingClick
              : getContactLinkEvent(link.label, link.href)
          }
        >
          {link.label}
        </ArrowLink>
      ))}
    </div>
  )
}

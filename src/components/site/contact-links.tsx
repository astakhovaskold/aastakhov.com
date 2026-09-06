import { ArrowLink } from '@/components/site/arrow-link'
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
        <ArrowLink
          href={link.href}
          key={link.label}
          trackingEvent={getContactLinkEvent(link.label, link.href)}
        >
          {link.label}
        </ArrowLink>
      ))}
    </div>
  )
}

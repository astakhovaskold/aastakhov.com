import { AnalyticsLink } from '@/components/site/analytics-link'
import { getContactLinkEvent } from '@/lib/analytics'
import type { PrimaryContact } from '@/lib/contact'

export function PrimaryContactButton(props: { contact: PrimaryContact; label: string }) {
  const { contact, label } = props
  const eventLabel = contact.kind === 'booking' ? 'Book a call' : 'Telegram'

  return (
    <p className="primary-action">
      <AnalyticsLink
        className="button-primary"
        href={contact.href}
        trackingEvent={getContactLinkEvent(eventLabel, contact.href)}
      >
        {label}
      </AnalyticsLink>
    </p>
  )
}

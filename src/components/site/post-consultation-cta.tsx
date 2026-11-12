import { ContactLinks } from '@/components/site/contact-links'
import { buildContactLinks } from '@/lib/contact'
import type { PublicSiteSettings } from '@/lib/siteSettings'

export function PostConsultationCta(props: {
  settings: Pick<PublicSiteSettings, 'bookingUrl' | 'email' | 'telegram'>
  text: string
  title: string
}) {
  const { settings, text, title } = props
  const links = buildContactLinks({
    bookingUrl: settings.bookingUrl,
    email: settings.email,
    telegram: settings.telegram,
  })

  if (links.length === 0) return null

  return (
    <aside aria-label={title} className="post-cta">
      <h2>{title}</h2>
      <p>{text}</p>
      <ContactLinks links={links} />
    </aside>
  )
}

import Link from 'next/link'

function isInternalHref(href: string): boolean {
  return href.startsWith('/')
}

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
      {links.map((link) =>
        isInternalHref(link.href) ? (
          <Link href={link.href} key={link.label}>
            {link.label} →
          </Link>
        ) : (
          <a href={link.href} key={link.label}>
            {link.label} →
          </a>
        ),
      )}
    </div>
  )
}

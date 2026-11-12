export type RssItem = {
  description?: null | string
  link: string
  pubDate?: Date | null | string
  title: string
}

export type RssFeedInput = {
  description: string
  items: RssItem[]
  language: string
  link: string
  selfLink: string
  title: string
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rfc822(value: Date | null | string | undefined): null | string {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date.toUTCString()
}

/** Builds an RSS 2.0 document. Items carry the title, summary and canonical link only. */
export function generateRssFeed(input: RssFeedInput): string {
  const items = input.items
    .map((item) => {
      const pubDate = rfc822(item.pubDate)

      return [
        '    <item>',
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
        item.description ? `      <description>${escapeXml(item.description)}</description>` : null,
        '    </item>',
      ]
        .filter((line): line is string => line !== null)
        .join('\n')
    })
    .join('\n')

  const newest = input.items.map((item) => rfc822(item.pubDate)).find(Boolean)

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(input.title)}</title>`,
    `    <link>${escapeXml(input.link)}</link>`,
    `    <description>${escapeXml(input.description)}</description>`,
    `    <language>${escapeXml(input.language)}</language>`,
    newest ? `    <lastBuildDate>${newest}</lastBuildDate>` : null,
    `    <atom:link href="${escapeXml(input.selfLink)}" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter((line): line is string => line !== null && line !== '')
    .join('\n')
}

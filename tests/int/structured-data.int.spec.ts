import { describe, expect, it } from 'vitest'

import { createBreadcrumbSchema, serializeJsonLd } from '@/lib/structured-data'

describe('structured data', () => {
  it('uses ld-generator for an ordered breadcrumb list', () => {
    const schema = createBreadcrumbSchema('en', [
      { name: 'Askold Astakhov', path: '/' },
      { name: 'Writing', path: '/posts' },
    ])

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1 },
        { '@type': 'ListItem', position: 2 },
      ],
    })
  })

  it('escapes HTML-significant characters before embedding JSON-LD', () => {
    expect(serializeJsonLd({ title: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })
})

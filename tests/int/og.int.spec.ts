import { describe, expect, it } from 'vitest'

import { createOgImage, ogContentType, ogSize } from '@/lib/og'

describe('Open Graph renderer', () => {
  it('renders a PNG social card at the standard dimensions', async () => {
    const image = createOgImage({
      description: 'A concise description.',
      kind: 'article',
      locale: 'en',
      title: 'A test article',
    })

    expect(image.headers.get('content-type')).toContain(ogContentType)
    expect(image.status).toBe(200)
    expect(ogSize).toEqual({ height: 630, width: 1200 })
  })
})

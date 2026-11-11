import React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PostDates } from '@/components/site/post-dates'

const texts = {
  publishedText: (date: string) => `Published ${date}`,
  updatedText: (date: string) => `Updated ${date}`,
}

describe('PostDates', () => {
  it('renders machine-readable published and modified dates', () => {
    const html = renderToString(
      <PostDates
        locale="en"
        modifiedAt="2026-11-10T12:00:00.000Z"
        publishedAt="2026-10-01T08:00:00.000Z"
        {...texts}
      />,
    )

    expect(html).toContain('dateTime="2026-10-01T08:00:00.000Z"')
    expect(html).toContain('Published October 1, 2026')
    expect(html).toContain('dateTime="2026-11-10T12:00:00.000Z"')
    expect(html).toContain('Updated November 10, 2026')
  })

  it('hides the modified date when it is on the publication day', () => {
    const html = renderToString(
      <PostDates
        locale="en"
        modifiedAt="2026-10-01T18:00:00.000Z"
        publishedAt="2026-10-01T08:00:00.000Z"
        {...texts}
      />,
    )

    expect(html).toContain('Published')
    expect(html).not.toContain('Updated')
  })

  it('renders nothing without dates', () => {
    expect(renderToString(<PostDates locale="en" {...texts} />)).toBe('')
  })
})

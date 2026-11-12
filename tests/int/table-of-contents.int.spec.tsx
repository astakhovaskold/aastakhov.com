import React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TableOfContents } from '@/components/site/table-of-contents'

describe('TableOfContents', () => {
  it('renders links to each heading in the initial HTML', () => {
    const html = renderToString(
      <TableOfContents
        headings={[
          { id: 'context', level: 2, text: 'Context' },
          { id: 'detail', level: 3, text: 'Detail' },
        ]}
        title="Contents"
      />,
    )

    expect(html).toContain('href="#context"')
    expect(html).toContain('href="#detail"')
    expect(html).toContain('Contents')
  })

  it('hides itself with fewer than two headings', () => {
    expect(
      renderToString(<TableOfContents headings={[{ id: 'only', level: 2, text: 'Only' }]} title="Contents" />),
    ).toBe('')
  })
})

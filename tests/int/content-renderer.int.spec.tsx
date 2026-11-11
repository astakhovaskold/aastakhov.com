// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { ContentRenderer, type RichTextDocument } from '@/components/site/content-renderer'
import { CalloutRenderer } from '@/components/site/callout-renderer'
import { CodeBlockRenderer } from '@/components/site/code-block-renderer'

describe('ContentRenderer and Article Blocks', () => {
  it('renders callout blocks with title and text', () => {
    const html = renderToString(
      <CalloutRenderer
        text="This is an important architecture rule."
        title="Architecture Contract"
        type="warning"
      />,
    )
    expect(html).toContain('callout-warning')
    expect(html).toContain('Architecture Contract')
    expect(html).toContain('This is an important architecture rule.')
  })

  it('renders Shiki highlighted code blocks server-side', async () => {
    const component = await CodeBlockRenderer({
      code: 'const greeting: string = "Hello World";',
      language: 'typescript',
    })
    const html = renderToString(component)

    expect(html).toContain('code-block-wrapper')
    expect(html).toContain('TypeScript')
    expect(html).toContain('shiki')
    expect(html).toContain('Hello World')
    expect(html).toContain('code-copy-btn')
  })

  it('renders rich text document with typography, lists and headings', () => {
    const doc: RichTextDocument = {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Boundaries before abstractions' }],
          },
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Use ' },
              { type: 'text', text: 'TypeScript', format: 8 },
              { type: 'text', text: ' for contracts.' },
            ],
          },
          {
            type: 'quote',
            children: [
              { type: 'text', text: 'Good architecture reduces decisions.' },
            ],
          },
        ],
      },
    }

    const html = renderToString(<ContentRenderer content={doc} />)

    expect(html).toContain('<h2>Boundaries before abstractions</h2>')
    expect(html).toContain('<code class="inline-code">TypeScript</code>')
    expect(html).toContain('<blockquote>Good architecture reduces decisions.</blockquote>')
  })
})

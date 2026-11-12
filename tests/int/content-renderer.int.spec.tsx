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

    expect(html).toContain('<h2 class="heading-anchored" id="boundaries-before-abstractions">Boundaries before abstractions')
    expect(html).toContain('<code class="inline-code">TypeScript</code>')
    expect(html).toContain('<blockquote>Good architecture reduces decisions.</blockquote>')
  })
})

describe('ContentRenderer heading anchors', () => {
  const heading = (tag: string, text: string) => ({
    children: [{ text, type: 'text' }],
    tag,
    type: 'heading',
  })

  it('gives h2 and h3 headings matching ids and permalink anchors', () => {
    const content = {
      root: { children: [heading('h2', 'Context'), heading('h3', 'Detail'), heading('h2', 'Context')] },
    } as unknown as RichTextDocument
    const html = renderToString(<ContentRenderer content={content} />)

    expect(html).toContain('id="context"')
    expect(html).toContain('id="detail"')
    expect(html).toContain('id="context-1"')
    expect(html).toContain('href="#context"')
    expect(html).toContain('class="heading-anchor"')
  })

  it('leaves other headings without ids', () => {
    const content = { root: { children: [heading('h4', 'Minor')] } } as unknown as RichTextDocument

    expect(renderToString(<ContentRenderer content={content} />)).not.toContain('id=')
  })
})

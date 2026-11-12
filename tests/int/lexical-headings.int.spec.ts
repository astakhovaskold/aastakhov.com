import { describe, expect, it } from 'vitest'

import { extractHeadingsFromLexical, slugifyHeading } from '@/lib/lexical-headings'

const heading = (tag: string, text: string) => ({ children: [{ text, type: 'text' }], tag, type: 'heading' })

describe('slugifyHeading', () => {
  it('builds kebab-case ids and keeps Cyrillic letters', () => {
    expect(slugifyHeading('Frontend Architecture')).toBe('frontend-architecture')
    expect(slugifyHeading('Почему это работает?')).toBe('почему-это-работает')
  })

  it('falls back when nothing usable is left', () => {
    expect(slugifyHeading('???')).toBe('section')
  })
})

describe('extractHeadingsFromLexical', () => {
  it('extracts h2 and h3 in document order and ignores other headings', () => {
    const headings = extractHeadingsFromLexical({
      root: {
        children: [heading('h1', 'Title'), heading('h2', 'Context'), heading('h3', 'Detail'), heading('h4', 'Skip')],
      },
    })

    expect(headings).toEqual([
      { id: 'context', level: 2, text: 'Context' },
      { id: 'detail', level: 3, text: 'Detail' },
    ])
  })

  it('numbers duplicate headings', () => {
    const headings = extractHeadingsFromLexical({
      root: { children: [heading('h2', 'Architecture'), heading('h2', 'Architecture'), heading('h3', 'Architecture')] },
    })

    expect(headings.map((entry) => entry.id)).toEqual(['architecture', 'architecture-1', 'architecture-2'])
  })

  it('skips empty headings and handles missing content', () => {
    expect(extractHeadingsFromLexical({ root: { children: [heading('h2', '   ')] } })).toEqual([])
    expect(extractHeadingsFromLexical(null)).toEqual([])
  })
})

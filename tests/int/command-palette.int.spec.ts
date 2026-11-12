import { describe, expect, it } from 'vitest'
import {
  buildPaletteGroups,
  flattenGroups,
  isPaletteHotkey,
  moveIndex,
} from '@/lib/command-palette'

const key = (k: string, extra = {}) => ({ key: k, metaKey: false, ctrlKey: false, ...extra })

describe('isPaletteHotkey', () => {
  it('matches Cmd+K and Ctrl+K', () => {
    expect(isPaletteHotkey(key('k', { metaKey: true }))).toBe(true)
    expect(isPaletteHotkey(key('K', { ctrlKey: true }))).toBe(true)
  })
  it('ignores plain k', () => {
    expect(isPaletteHotkey(key('k'))).toBe(false)
  })
  it('matches / outside inputs only', () => {
    expect(isPaletteHotkey(key('/', { target: { tagName: 'BODY' } }))).toBe(true)
    expect(isPaletteHotkey(key('/', { target: { tagName: 'INPUT' } }))).toBe(false)
    expect(isPaletteHotkey(key('/', { target: { tagName: 'DIV', isContentEditable: true } }))).toBe(false)
  })
})

describe('buildPaletteGroups', () => {
  const response = {
    results: {
      posts: [{ title: 'ISR notes', description: 'a  b', url: '/ru/posts/isr' }],
      projects: [{ title: 'Automatica', description: 'x', url: '/ru/projects/a' }],
      openSource: [
        { name: 'lib', description: 'y', url: 'https://github.com/x/lib' },
        { name: 'no-url', description: '', url: '' },
      ],
      cv: { role: 'Frontend Architect', summary: 'Next.js and React', stack: 'TypeScript' },
    },
  }

  it('groups in order and drops entries without url', () => {
    const groups = buildPaletteGroups(response, 'next', 'ru')
    expect(groups.map((g) => g.key)).toEqual(['articles', 'projects', 'openSource', 'skills'])
    expect(groups[2].items).toHaveLength(1)
    expect(groups[2].items[0].external).toBe(true)
    expect(groups[0].items[0].description).toBe('a b')
  })

  it('adds the CV entry only when the query matches', () => {
    expect(buildPaletteGroups(response, 'zzz', 'en').some((g) => g.key === 'skills')).toBe(false)
    const skills = buildPaletteGroups(response, 'typescript', 'en').find((g) => g.key === 'skills')
    expect(skills?.items[0].href).toBe('/en/cv')
  })

  it('handles an empty response', () => {
    expect(buildPaletteGroups({}, 'a', 'ru')).toEqual([])
    expect(flattenGroups([])).toEqual([])
  })
})

describe('moveIndex', () => {
  it('wraps both ways', () => {
    expect(moveIndex(-1, 1, 3)).toBe(0)
    expect(moveIndex(-1, -1, 3)).toBe(2)
    expect(moveIndex(2, 1, 3)).toBe(0)
    expect(moveIndex(0, -1, 3)).toBe(2)
    expect(moveIndex(0, 1, 0)).toBe(-1)
  })
})

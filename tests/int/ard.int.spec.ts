import { describe, expect, it } from 'vitest'

import { buildArdManifest, buildLegacyAiCatalog } from '@/lib/ard'

const site = 'https://www.example.com'

describe('ARD manifest', () => {
  const { entries } = buildArdManifest(site)

  it('has a non-empty entries array', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it('gives every entry a domain-anchored URN, a display name and a media type', () => {
    for (const entry of entries) {
      expect(entry.identifier).toMatch(/^urn:air:[a-z0-9.-]+:[a-z0-9-]+:[a-z0-9-]+$/)
      expect(entry.displayName.length).toBeGreaterThan(0)
      expect(entry.type).toMatch(/^[a-z]+\/[a-z0-9.+-]+$/)
    }
  })

  it('gives every entry exactly one of url or data', () => {
    for (const entry of entries) {
      const hasUrl = 'url' in entry
      const hasData = 'data' in entry
      expect(hasUrl !== hasData).toBe(true)
    }
  })

  it('has 2 to 5 representative queries per entry and unique identifiers', () => {
    for (const entry of entries) {
      expect(entry.representativeQueries.length).toBeGreaterThanOrEqual(2)
      expect(entry.representativeQueries.length).toBeLessThanOrEqual(5)
    }
    expect(new Set(entries.map((e) => e.identifier)).size).toBe(entries.length)
  })

  it('keeps the legacy ai-catalog fields next to entries', () => {
    const legacy = buildLegacyAiCatalog(site)
    expect(legacy.entries).toEqual(entries)
    expect(legacy.endpoints).toHaveLength(2)
    expect(legacy.documentation).toBe(`${site}/llms.txt`)
  })
})

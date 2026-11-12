import { describe, expect, it } from 'vitest'

import { ROLE, ruCv, ruExperience, siteSettingsByLocale } from '../../src/migrations/data/owner-decisions'

describe('owner decisions content', () => {
  it('uses one role and location wording in both locales', () => {
    expect(ruCv.role).toBe(ROLE)
    expect(siteSettingsByLocale.ru.jobTitle).toBe(ROLE)
    expect(siteSettingsByLocale.en.jobTitle).toBe(ROLE)
    expect(siteSettingsByLocale.en.location).toBe('Remote')
    expect(siteSettingsByLocale.ru.location).toBe('Удалённо')
    expect(siteSettingsByLocale.ru.homeEyebrow).not.toMatch(/[A-Za-z]{4,}\b.*Available/)
  })

  it('keeps the team size at 6-8 and drops the old figures', () => {
    const text = JSON.stringify([ruCv, ruExperience])

    expect(text).toContain('6–8')
    expect(text).not.toContain('до 20')
    expect(text).not.toContain('около 20')
  })

  it('carries the EN metrics into the RU CV', () => {
    const text = JSON.stringify(ruExperience)

    for (const metric of ['−60%', '1,5 до 0,4', '78%', '240 тыс.', '2,8 с до 300 мс', '2,3 с до 300 мс']) {
      expect(text).toContain(metric)
    }
  })

  it('covers every employer of the CV once', () => {
    expect(ruExperience.map((item) => item.company)).toEqual([
      'Philosophy.IT',
      'Tectus.IT',
      'Element',
      'Webit',
      'ICS Monitoring',
      'Seoproduction',
    ])
  })

  it('has the same number of proof points in both locales', () => {
    expect(siteSettingsByLocale.ru.proof).toHaveLength(siteSettingsByLocale.en.proof.length)
    expect(siteSettingsByLocale.ru.proof.length).toBeGreaterThanOrEqual(2)
  })
})

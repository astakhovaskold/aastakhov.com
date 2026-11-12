import { describe, expect, it } from 'vitest'
import {
  buildBaselineHeaders,
  buildContentSecurityPolicy,
  buildCspHeader,
  cspSourcePattern,
  toOrigin,
} from '@/lib/security-headers'

describe('security headers', () => {
  it('has every baseline header', () => {
    const keys = buildBaselineHeaders().map((h) => h.key)
    expect(keys).toEqual(
      expect.arrayContaining([
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
        'X-Frame-Options',
        'Strict-Transport-Security',
      ]),
    )
  })

  it('HSTS skips includeSubDomains until confirmed', () => {
    const value = (o = {}) =>
      buildBaselineHeaders(o).find((h) => h.key === 'Strict-Transport-Security')!.value
    expect(value()).toBe('max-age=63072000')
    expect(value({ hstsIncludeSubDomains: true })).toContain('includeSubDomains')
  })

  it('CSP allows analytics origin and blocks object/base abuse', () => {
    const csp = buildContentSecurityPolicy({ analyticsOrigin: 'https://umami.example.com' })
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://umami.example.com")
    expect(csp).toContain("connect-src 'self' https://umami.example.com")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toContain('unsafe-eval')
  })

  it('allows eval only in dev', () => {
    expect(buildContentSecurityPolicy({ isDev: true })).toContain("'unsafe-eval'")
  })

  it('is Report-Only unless enforced', () => {
    expect(buildCspHeader().key).toBe('Content-Security-Policy-Report-Only')
    expect(buildCspHeader({ enforce: true }).key).toBe('Content-Security-Policy')
  })

  it('CSP source pattern excludes admin, api and oauth', () => {
    const pattern = new RegExp(`^${cspSourcePattern().replace('/:path', '/')}$`)
    expect(pattern.test('/ru')).toBe(true)
    expect(pattern.test('/ru/posts/x')).toBe(true)
    expect(pattern.test('/admin')).toBe(false)
    expect(pattern.test('/admin/collections')).toBe(false)
    expect(pattern.test('/api/mcp')).toBe(false)
    expect(pattern.test('/oauth/token')).toBe(false)
    expect(pattern.test('/administrator-guide')).toBe(true)
  })

  it('toOrigin handles bad input', () => {
    expect(toOrigin('https://a.com/x')).toBe('https://a.com')
    expect(toOrigin('nope')).toBeUndefined()
    expect(toOrigin(undefined)).toBeUndefined()
  })
})

type Header = { key: string; value: string }

export type SecurityHeaderOptions = {
  /** Origin of the Umami analytics instance, e.g. https://umami.aastakhov.com */
  analyticsOrigin?: string
  /** Dev server needs eval for React refresh. */
  isDev?: boolean
  /** Add includeSubDomains only after every subdomain is confirmed HTTPS-only (task 1.4). */
  hstsIncludeSubDomains?: boolean
}

/** Paths that keep their own policy: Payload admin, JSON APIs and OAuth endpoints. */
export const CSP_EXCLUDED_PREFIXES = ['admin', 'api', 'oauth'] as const

export function toOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}

export function buildContentSecurityPolicy({
  analyticsOrigin,
  isDev = false,
}: SecurityHeaderOptions = {}): string {
  const analytics = analyticsOrigin ? ` ${analyticsOrigin}` : ''
  const directives = [
    `default-src 'self'`,
    // Static CSP (no nonce) so pages stay cacheable; Next injects inline bootstrap scripts.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${analytics}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self'${analytics}`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ]

  return directives.join('; ')
}

export function buildBaselineHeaders(options: SecurityHeaderOptions = {}): Header[] {
  const hsts = `max-age=63072000${options.hstsIncludeSubDomains ? '; includeSubDomains' : ''}`

  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    },
    // Report-Only ignores frame-ancestors, so keep an enforced clickjacking guard.
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Strict-Transport-Security', value: hsts },
  ]
}

/** CSP header. Report-Only until a clean week of reports (task 5.4). */
export function buildCspHeader(options: SecurityHeaderOptions & { enforce?: boolean } = {}): Header {
  return {
    key: options.enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    value: buildContentSecurityPolicy(options),
  }
}

/** Next `source` pattern matching every path except the excluded prefixes. */
export function cspSourcePattern(): string {
  const excluded = CSP_EXCLUDED_PREFIXES.map((prefix) => `${prefix}(?:/|$)`).join('|')
  return `/:path((?!${excluded}).*)`
}

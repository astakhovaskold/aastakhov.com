import crypto from 'node:crypto'
import type { MCPAccessSettings } from '@payloadcms/plugin-mcp'
import type { TypedUser } from 'payload'

export const DEFAULT_ORIGIN = 'https://www.aastakhov.com'
export const ACCESS_TOKEN_EXPIRY_SECONDS = 3600 // 1 hour
export const REFRESH_TOKEN_EXPIRY_DAYS = 30 // 30 days
export const oauthScopes = 'content:read content:write'

const CHATGPT_ALLOWED_REDIRECT_URIS = [
  'https://chatgpt.com/connector_platform_oauth_redirect',
]

/**
 * Resolves request origin dynamically from headers (supporting reverse proxies,
 * Vercel preview environments, and local development), falling back to configured env or default.
 */
export const getRequestOrigin = (
  headersOrReq?: Headers | Request | { headers?: Headers } | null,
): string => {
  if (headersOrReq) {
    const headers =
      'headers' in headersOrReq && headersOrReq.headers
        ? headersOrReq.headers
        : (headersOrReq as Headers)
    if (typeof headers?.get === 'function') {
      const proto = headers.get('x-forwarded-proto') || 'https'
      const host = headers.get('x-forwarded-host') || headers.get('host')
      if (host) {
        const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : proto
        return `${protocol}://${host}`
      }
    }
  }

  return process.env.MCP_PUBLIC_ORIGIN || process.env.NEXT_PUBLIC_SERVER_URL || DEFAULT_ORIGIN
}

export const mcpOrigin = (headersOrReq?: Headers | Request | { headers?: Headers } | null) =>
  getRequestOrigin(headersOrReq)
export const mcpAudience = (headersOrReq?: Headers | Request | { headers?: Headers } | null) =>
  `${mcpOrigin(headersOrReq)}/api/mcp`

const secret = () => {
  const value = process.env.MCP_OAUTH_SECRET || process.env.PAYLOAD_SECRET
  if (!value) throw new Error('MCP_OAUTH_SECRET or PAYLOAD_SECRET must be configured')
  return value
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url')
const json = (value: unknown) => base64url(JSON.stringify(value))

export type OAuthClaims = {
  aud: string
  collection: string
  exp: number
  iat: number
  iss: string
  scope: string
  sub: string
  type: 'access' | 'code' | 'refresh'
  [key: string]: unknown
}

export const signOAuthToken = (claims: Omit<OAuthClaims, 'iat'>) => {
  const header = json({ alg: 'HS256', typ: 'JWT' })
  const body = json({ ...claims, iat: Math.floor(Date.now() / 1000) })
  const input = `${header}.${body}`
  const signature = crypto.createHmac('sha256', secret()).update(input).digest('base64url')
  return `${input}.${signature}`
}

export const verifyOAuthToken = (
  token: string,
  type: OAuthClaims['type'],
  options?: { expectedOrigin?: string; expectedAudience?: string; allowAnyOrigin?: boolean },
) => {
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature) return null
  const expected = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest()
  const received = Buffer.from(signature, 'base64url')
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null

  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthClaims
    if (claims.type !== type || claims.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }

    if (!claims.aud?.endsWith('/api/mcp')) {
      return null
    }

    if (options?.expectedAudience && claims.aud !== options.expectedAudience) {
      return null
    }

    if (!options?.allowAnyOrigin) {
      const allowedOrigins = [
        options?.expectedOrigin,
        mcpOrigin(),
        DEFAULT_ORIGIN,
        'https://aastakhov.com',
      ].filter(Boolean) as string[]

      const matchesOrigin = allowedOrigins.some((orig) => {
        try {
          return new URL(claims.iss).host === new URL(orig).host
        } catch {
          return claims.iss === orig
        }
      })

      if (!matchesOrigin) {
        return null
      }
    }

    return claims
  } catch {
    return null
  }
}

export const sha256base64url = (value: string) => crypto.createHash('sha256').update(value).digest('base64url')
export const createAuthorizationCode = () => crypto.randomBytes(32).toString('base64url')
export const createRefreshToken = () => crypto.randomBytes(48).toString('base64url')

export const oauthCapabilities = (user: TypedUser): MCPAccessSettings => ({
  user: { ...user, collection: user.collection || 'users', _strategy: 'mcp-oauth' } as unknown as TypedUser,
  posts: { find: true, create: true, update: true },
  projects: { find: true, create: true, update: true },
  openSource: { find: true, create: true, update: true },
  postCategories: { find: true },
  media: { find: true },
  cv: { find: true, update: true },
  siteSettings: { find: true },
})

export const publicReadCapabilities = (): MCPAccessSettings => ({
  user: {
    id: 0,
    email: 'public-agent@aastakhov.com',
    collection: 'users',
    _strategy: 'public-agent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as TypedUser,
  posts: { find: true, create: false, update: false, delete: false },
  projects: { find: true, create: false, update: false, delete: false },
  openSource: { find: true, create: false, update: false, delete: false },
  postCategories: { find: true, create: false, update: false, delete: false },
  media: { find: true, create: false, update: false, delete: false },
  cv: { find: true, update: false },
  siteSettings: { find: true, update: false },
})

export const parseScopes = (scopeStr: string): string[] => {
  return scopeStr
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export const validateScopes = (scopeStr: string): boolean => {
  if (!scopeStr || scopeStr === '*') return true
  const requested = parseScopes(scopeStr)
  const allowed = parseScopes(oauthScopes)
  return requested.every((r) => allowed.includes(r))
}

const isAuthorizedChatGPTRedirect = (redirectURI: string): boolean => {
  return (
    CHATGPT_ALLOWED_REDIRECT_URIS.includes(redirectURI) ||
    redirectURI.startsWith('https://chatgpt.com/connector/')
  )
}

export const isChatGPTClient = (clientID: string, redirectURI: string): boolean => {
  const isKnownClient =
    clientID === 'aastakhov-payloadcms' ||
    clientID === 'https://chatgpt.com/oauth/client.json' ||
    Boolean(process.env.MCP_OAUTH_CLIENT_ID && clientID === process.env.MCP_OAUTH_CLIENT_ID)

  if (!isKnownClient) return false

  if (isAuthorizedChatGPTRedirect(redirectURI)) {
    return true
  }

  // Allow localhost redirect in non-production environments
  if (
    process.env.NODE_ENV !== 'production' &&
    (redirectURI.startsWith('http://localhost') || redirectURI.startsWith('http://127.0.0.1'))
  ) {
    return true
  }

  return false
}

export const isValidOAuthClient = (clientID: string, redirectURI: string): boolean => {
  if (isChatGPTClient(clientID, redirectURI)) return true

  // Allow custom configured clients if both client and redirect match
  const allowedClients = (process.env.MCP_OAUTH_ALLOWED_CLIENTS || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

  if (allowedClients.includes(clientID)) {
    // If client is in allowed list, ensure redirect URI is at least an HTTPS URL or local dev
    try {
      const parsed = new URL(redirectURI)
      if (parsed.protocol === 'https:' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return true
      }
    } catch {
      return false
    }
  }

  return false
}

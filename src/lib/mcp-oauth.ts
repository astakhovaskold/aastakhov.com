import crypto from 'node:crypto'
import type { MCPAccessSettings } from '@payloadcms/plugin-mcp'
import type { TypedUser } from 'payload'

export const mcpOrigin = () => process.env.MCP_PUBLIC_ORIGIN || 'https://www.aastakhov.com'
export const mcpAudience = () => `${mcpOrigin()}/api/mcp`

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
  type: 'access' | 'code'
  [key: string]: unknown
}

export const signOAuthToken = (claims: Omit<OAuthClaims, 'iat'>) => {
  const header = json({ alg: 'HS256', typ: 'JWT' })
  const body = json({ ...claims, iat: Math.floor(Date.now() / 1000) })
  const input = `${header}.${body}`
  const signature = crypto.createHmac('sha256', secret()).update(input).digest('base64url')
  return `${input}.${signature}`
}

export const verifyOAuthToken = (token: string, type: OAuthClaims['type']) => {
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature) return null
  const expected = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest()
  const received = Buffer.from(signature, 'base64url')
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null

  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthClaims
    if (
      claims.type !== type ||
      claims.iss !== mcpOrigin() ||
      claims.aud !== mcpAudience() ||
      claims.exp <= Math.floor(Date.now() / 1000)
    ) return null
    return claims
  } catch {
    return null
  }
}

export const sha256base64url = (value: string) => crypto.createHash('sha256').update(value).digest('base64url')
export const createAuthorizationCode = () => crypto.randomBytes(32).toString('base64url')

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

export const oauthScopes = 'content:read content:write'
export const isChatGPTClient = (clientID: string, redirectURI: string) =>
  clientID === 'https://chatgpt.com/oauth/client.json' &&
  (redirectURI === 'https://chatgpt.com/connector_platform_oauth_redirect' ||
    redirectURI.startsWith('https://chatgpt.com/connector/'))

import { getPayload } from 'payload'

import config from '@/payload.config'
import {
  isChatGPTClient,
  createAuthorizationCode,
  mcpAudience,
  mcpOrigin,
  oauthScopes,
  sha256base64url,
} from '@/lib/mcp-oauth'

export const dynamic = 'force-dynamic'

const invalid = (message: string) => new Response(message, { status: 400 })

const readParams = (url: URL) => ({
  clientID: url.searchParams.get('client_id') || '',
  codeChallenge: url.searchParams.get('code_challenge') || '',
  codeChallengeMethod: url.searchParams.get('code_challenge_method') || '',
  redirectURI: url.searchParams.get('redirect_uri') || '',
  responseType: url.searchParams.get('response_type') || '',
  scope: url.searchParams.get('scope') || '',
  state: url.searchParams.get('state') || '',
})

const validate = (params: ReturnType<typeof readParams>) => {
  if (!isChatGPTClient(params.clientID, params.redirectURI)) return 'Unsupported OAuth client.'
  if (params.responseType !== 'code') return 'Only the authorization-code flow is supported.'
  if (!params.codeChallenge || params.codeChallengeMethod !== 'S256') return 'PKCE S256 is required.'
  if (params.scope !== oauthScopes) return 'Unsupported OAuth scopes.'
  return null
}

const authorize = async (request: Request, params: ReturnType<typeof readParams>) => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response('Sign in to Payload Admin, then restart the ChatGPT connection.', { status: 401 })
  }

  const code = createAuthorizationCode()
  await payload.create({
    collection: 'mcp-oauth-codes',
    data: {
      codeHash: sha256base64url(code),
      user: user.id,
      clientID: params.clientID,
      redirectURI: params.redirectURI,
      codeChallenge: params.codeChallenge,
      scope: params.scope,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    },
    overrideAccess: true,
  } as any)
  const redirect = new URL(params.redirectURI)
  redirect.searchParams.set('code', code)
  redirect.searchParams.set('state', params.state)
  return Response.redirect(redirect)
}

export async function GET(request: Request) {
  const params = readParams(new URL(request.url))
  const error = validate(params)
  if (error) return invalid(error)

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Sign in to Payload Admin, then restart the ChatGPT connection.', { status: 401 })

  return new Response(
    `<!doctype html><title>Authorize ChatGPT</title><main><h1>Authorize ChatGPT</h1><p>ChatGPT will be allowed to read and update the configured website content. Deletion is never allowed.</p><form method="post"><input name="query" type="hidden" value="${encodeURIComponent(new URL(request.url).search)}"><button type="submit">Allow</button></form></main>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

export async function POST(request: Request) {
  const form = await request.formData()
  const query = String(form.get('query') || '')
  const params = readParams(new URL(`/oauth/authorize${decodeURIComponent(query)}`, mcpOrigin()))
  const error = validate(params)
  if (error) return invalid(error)
  return authorize(request, params)
}

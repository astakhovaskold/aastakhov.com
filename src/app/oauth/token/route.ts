import { getPayload } from 'payload'

import config from '@/payload.config'
import { mcpAudience, mcpOrigin, oauthScopes, sha256base64url, signOAuthToken } from '@/lib/mcp-oauth'

export const dynamic = 'force-dynamic'

const oauthError = (error: string, description: string) =>
  Response.json({ error, error_description: description }, { status: 400 })

export async function POST(request: Request) {
  const body = await request.formData()
  if (body.get('grant_type') !== 'authorization_code') return oauthError('unsupported_grant_type', 'Only authorization_code is supported.')

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'mcp-oauth-codes' as never,
    where: { codeHash: { equals: sha256base64url(String(body.get('code') || '')) } },
    limit: 1,
    overrideAccess: true,
  })
  const code = docs[0] as any
  if (!code || code.usedAt || new Date(code.expiresAt).getTime() <= Date.now()) return oauthError('invalid_grant', 'Authorization code is invalid or expired.')
  if (
    code.clientID !== body.get('client_id') ||
    code.redirectURI !== body.get('redirect_uri') ||
    sha256base64url(String(body.get('code_verifier') || '')) !== code.codeChallenge
  ) return oauthError('invalid_grant', 'Authorization code does not match this PKCE request.')

  await payload.update({ collection: 'mcp-oauth-codes', id: code.id, data: { usedAt: new Date().toISOString() }, overrideAccess: true } as any)

  const accessToken = signOAuthToken({
    aud: mcpAudience(),
    collection: 'users',
    exp: Math.floor(Date.now() / 1000) + 900,
    iss: mcpOrigin(),
    scope: oauthScopes,
    sub: code.sub,
    type: 'access',
  })
  return Response.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 900, scope: oauthScopes })
}

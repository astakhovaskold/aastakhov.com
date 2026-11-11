import { getPayload } from 'payload'

import config from '@/payload.config'
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_DAYS,
  createAuthorizationCode,
  createRefreshToken,
  mcpAudience,
  mcpOrigin,
  oauthScopes,
  sha256base64url,
  signOAuthToken,
} from '@/lib/mcp-oauth'
import { handleCorsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

const oauthError = (error: string, description: string, status = 400, request?: Request) =>
  withCors(
    Response.json({ error, error_description: description }, { status }),
    request,
    NO_CACHE_HEADERS,
  )

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

async function getParams(request: Request): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const contentType = request.headers.get('content-type') || ''

  try {
    const rawText = await request.text()
    if (!rawText) return map

    if (contentType.includes('application/json')) {
      try {
        const data = JSON.parse(rawText)
        if (typeof data === 'object' && data !== null) {
          for (const [key, val] of Object.entries(data)) {
            map.set(key, String(val))
          }
          return map
        }
      } catch {
        // Fall back to urlencoded
      }
    }

    const search = new URLSearchParams(rawText)
    for (const [key, val] of search.entries()) {
      map.set(key, val)
    }
  } catch {
    // Return whatever was collected
  }

  return map
}

export async function POST(request: Request) {
  const params = await getParams(request)
  const grantType = params.get('grant_type')

  if (!grantType) {
    return oauthError('invalid_request', 'Missing grant_type parameter.', 400, request)
  }

  const payload = await getPayload({ config })
  const origin = mcpOrigin(request)
  const audience = mcpAudience(request)

  if (grantType === 'authorization_code') {
    const codeVal = params.get('code') || ''
    const clientID = params.get('client_id') || ''
    const redirectURI = params.get('redirect_uri') || ''
    const codeVerifier = params.get('code_verifier') || ''

    if (!codeVal) {
      return oauthError('invalid_request', 'Missing authorization code.', 400, request)
    }

    const { docs } = await payload.find({
      collection: 'mcp-oauth-codes' as never,
      where: { codeHash: { equals: sha256base64url(codeVal) } },
      limit: 1,
      overrideAccess: true,
    })

    const code = docs[0] as any
    if (!code || code.usedAt || new Date(code.expiresAt).getTime() <= Date.now()) {
      return oauthError('invalid_grant', 'Authorization code is invalid or expired.', 400, request)
    }

    if (code.clientID && clientID !== code.clientID) {
      return oauthError('invalid_grant', 'client_id does not match the authorization code.', 400, request)
    }

    if (code.redirectURI && redirectURI !== code.redirectURI) {
      return oauthError('invalid_grant', 'redirect_uri does not match the authorization code.', 400, request)
    }

    if (!codeVerifier || sha256base64url(codeVerifier) !== code.codeChallenge) {
      return oauthError('invalid_grant', 'code_verifier does not match the authorization code challenge.', 400, request)
    }

    const userID = typeof code.user === 'object' && code.user ? code.user.id : code.user
    if (!userID) {
      return oauthError('invalid_grant', 'Authorization code has no associated user.', 400, request)
    }

    const newRefreshToken = createRefreshToken()
    const refreshTokenHash = sha256base64url(newRefreshToken)
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86_400_000).toISOString()

    // Atomically mark code as used
    const updated = await payload.update({
      collection: 'mcp-oauth-codes',
      where: {
        id: { equals: code.id },
        usedAt: { exists: false },
      },
      data: {
        usedAt: new Date().toISOString(),
        refreshTokenHash,
        refreshTokenExpiresAt,
        refreshTokenUsedAt: null,
      },
      overrideAccess: true,
    } as any)

    if (!updated.docs || updated.docs.length === 0) {
      return oauthError('invalid_grant', 'Authorization code has already been used.', 400, request)
    }

    const accessToken = signOAuthToken({
      aud: audience,
      collection: 'users',
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
      iss: origin,
      scope: code.scope || oauthScopes,
      sub: String(userID),
      type: 'access',
    })

    return withCors(
      Response.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
        refresh_token: newRefreshToken,
        scope: code.scope || oauthScopes,
      }),
      request,
      NO_CACHE_HEADERS,
    )
  }

  if (grantType === 'refresh_token') {
    const refreshTokenVal = params.get('refresh_token') || ''
    if (!refreshTokenVal) {
      return oauthError('invalid_request', 'Missing refresh_token parameter.', 400, request)
    }

    const tokenHash = sha256base64url(refreshTokenVal)
    const { docs } = await payload.find({
      collection: 'mcp-oauth-codes' as never,
      where: { refreshTokenHash: { equals: tokenHash } },
      limit: 1,
      overrideAccess: true,
    })

    const tokenDoc = docs[0] as any
    if (
      !tokenDoc ||
      tokenDoc.refreshTokenUsedAt ||
      !tokenDoc.refreshTokenExpiresAt ||
      new Date(tokenDoc.refreshTokenExpiresAt).getTime() <= Date.now()
    ) {
      return oauthError('invalid_grant', 'Refresh token is invalid, expired, or already revoked.', 400, request)
    }

    const clientID = params.get('client_id')
    if (clientID && tokenDoc.clientID && tokenDoc.clientID !== clientID) {
      return oauthError('invalid_grant', 'Client ID mismatch for refresh token.', 400, request)
    }

    const userID = typeof tokenDoc.user === 'object' && tokenDoc.user ? tokenDoc.user.id : tokenDoc.user
    if (!userID) {
      return oauthError('invalid_grant', 'Refresh token has no associated user.', 400, request)
    }

    // Atomically mark current refresh token as used
    const updated = await payload.update({
      collection: 'mcp-oauth-codes',
      where: {
        id: { equals: tokenDoc.id },
        refreshTokenUsedAt: { exists: false },
      },
      data: { refreshTokenUsedAt: new Date().toISOString() },
      overrideAccess: true,
    } as any)

    if (!updated.docs || updated.docs.length === 0) {
      return oauthError('invalid_grant', 'Refresh token has already been consumed.', 400, request)
    }

    // Issue rotated refresh token
    const nextRefreshToken = createRefreshToken()
    const nextRefreshTokenHash = sha256base64url(nextRefreshToken)
    const nextExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86_400_000).toISOString()

    await payload.create({
      collection: 'mcp-oauth-codes',
      data: {
        codeHash: `refresh_${sha256base64url(createAuthorizationCode())}`,
        user: userID,
        clientID: tokenDoc.clientID,
        redirectURI: tokenDoc.redirectURI,
        codeChallenge: 'rotated',
        scope: tokenDoc.scope || oauthScopes,
        expiresAt: nextExpiresAt,
        refreshTokenHash: nextRefreshTokenHash,
        refreshTokenExpiresAt: nextExpiresAt,
      },
      overrideAccess: true,
    } as any)

    const accessToken = signOAuthToken({
      aud: audience,
      collection: 'users',
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
      iss: origin,
      scope: tokenDoc.scope || oauthScopes,
      sub: String(userID),
      type: 'access',
    })

    return withCors(
      Response.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
        refresh_token: nextRefreshToken,
        scope: tokenDoc.scope || oauthScopes,
      }),
      request,
      NO_CACHE_HEADERS,
    )
  }

  return oauthError('unsupported_grant_type', `Unsupported grant_type: ${grantType}.`, 400, request)
}

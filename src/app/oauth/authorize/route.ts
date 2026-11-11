import { getPayload } from 'payload'

import config from '@/payload.config'
import {
  createAuthorizationCode,
  isValidOAuthClient,
  mcpOrigin,
  oauthScopes,
  sha256base64url,
  validateScopes,
} from '@/lib/mcp-oauth'
import { handleCorsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

const invalid = (message: string, request?: Request) =>
  withCors(new Response(message, { status: 400 }), request)

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

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
  if (!isValidOAuthClient(params.clientID, params.redirectURI)) {
    return 'Unsupported OAuth client.'
  }
  if (params.responseType !== 'code') {
    return 'Only the authorization-code flow is supported.'
  }
  if (!params.codeChallenge || params.codeChallengeMethod !== 'S256') {
    return 'PKCE S256 is required.'
  }
  if (params.scope && !validateScopes(params.scope)) {
    return 'Unsupported OAuth scopes.'
  }
  return null
}

const authorize = async (request: Request, params: ReturnType<typeof readParams>) => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    const returnUrl = encodeURIComponent(new URL(request.url).pathname + new URL(request.url).search)
    return Response.redirect(new URL(`/admin/login?redirect=${returnUrl}`, request.url))
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
      scope: params.scope || oauthScopes,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    },
    overrideAccess: true,
  } as any)

  const redirect = new URL(params.redirectURI)
  redirect.searchParams.set('code', code)
  if (params.state) {
    redirect.searchParams.set('state', params.state)
  }

  return Response.redirect(redirect)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = readParams(url)
  const error = validate(params)
  if (error) return invalid(error, request)

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    const returnUrl = encodeURIComponent(url.pathname + url.search)
    return Response.redirect(new URL(`/admin/login?redirect=${returnUrl}`, request.url))
  }

  const userEmail = user && 'email' in user ? (user.email as string) : 'Admin'
  const clientName = params.clientID === 'aastakhov-payloadcms' ? 'ChatGPT (Askold Content)' : params.clientID

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorize AI Connector — Askold Astakhov</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f1117;
      color: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #181c27;
      border: 1px solid #282f44;
      border-radius: 12px;
      max-width: 440px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 { font-size: 1.25rem; font-weight: 600; margin-top: 0; color: #f9fafb; }
    p { font-size: 0.925rem; line-height: 1.5; color: #9ca3af; margin: 0.75rem 0; }
    .badge {
      display: inline-block;
      background: #252b3d;
      color: #93c5fd;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.825rem;
      font-family: monospace;
      margin: 0.5rem 0 1rem;
    }
    .permissions {
      background: #12151e;
      border: 1px solid #23293a;
      border-radius: 8px;
      padding: 0.875rem;
      margin: 1rem 0 1.5rem;
      font-size: 0.85rem;
      color: #d1d5db;
    }
    .permissions ul { margin: 0.25rem 0 0 1.25rem; padding: 0; }
    .permissions li { margin-bottom: 0.25rem; }
    .btn {
      display: block;
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s ease;
    }
    .btn-primary { background: #2563eb; color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
    .footer { font-size: 0.75rem; color: #6b7280; text-align: center; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Authorize Application</h1>
    <p>Allow the following AI client to connect to your site via MCP:</p>
    <div class="badge">${clientName}</div>

    <div class="permissions">
      <strong>Permissions requested:</strong>
      <ul>
        <li>Read posts, projects, open-source records, and CV</li>
        <li>Create and update draft content as <em>${userEmail}</em></li>
        <li>Deletion is disabled</li>
      </ul>
    </div>

    <form method="post">
      <input name="query" type="hidden" value="${encodeURIComponent(url.search)}">
      <button class="btn btn-primary" type="submit">Authorize and Connect</button>
    </form>
    <div class="footer">Signed in as ${userEmail} • Token expires in 30 days</div>
  </div>
</body>
</html>`

  return withCors(
    new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
    request,
  )
}

export async function POST(request: Request) {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite && secFetchSite === 'cross-site') {
    return invalid('Cross-site submission not permitted.', request)
  }

  const originHeader = request.headers.get('origin')
  if (originHeader) {
    try {
      const expectedHost = new URL(mcpOrigin(request)).host
      const incomingHost = new URL(originHeader).host
      if (expectedHost !== incomingHost) {
        return invalid('Invalid request origin.', request)
      }
    } catch {
      return invalid('Malformed origin.', request)
    }
  }

  const form = await request.formData()
  const query = String(form.get('query') || '')
  const params = readParams(new URL(`/oauth/authorize${decodeURIComponent(query)}`, mcpOrigin(request)))
  const error = validate(params)
  if (error) return invalid(error, request)
  return authorize(request, params)
}

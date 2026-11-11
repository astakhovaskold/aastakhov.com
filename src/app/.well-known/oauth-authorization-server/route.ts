import { mcpOrigin } from '@/lib/mcp-oauth'
import { handleCorsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export function GET(request: Request) {
  const issuer = mcpOrigin(request)
  return withCors(
    Response.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    }),
    request,
  )
}

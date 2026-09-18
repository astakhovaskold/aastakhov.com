import { mcpOrigin } from '@/lib/mcp-oauth'

export const dynamic = 'force-dynamic'

export function GET() {
  const issuer = mcpOrigin()
  return Response.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
  })
}

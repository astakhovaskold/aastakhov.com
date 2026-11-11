import { mcpAudience, mcpOrigin, oauthScopes } from '@/lib/mcp-oauth'
import { handleCorsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export function GET(request: Request) {
  const origin = mcpOrigin(request)
  const audience = mcpAudience(request)

  return withCors(
    Response.json({
      resource: audience,
      authorization_servers: [origin],
      scopes_supported: oauthScopes.split(' '),
      resource_documentation: `${origin}/docs/payload-mcp`,
    }),
    request,
  )
}

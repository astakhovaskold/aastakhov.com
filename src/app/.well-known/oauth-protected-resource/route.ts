import { mcpAudience, mcpOrigin, oauthScopes } from '@/lib/mcp-oauth'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    resource: mcpAudience(),
    authorization_servers: [mcpOrigin()],
    scopes_supported: oauthScopes.split(' '),
    resource_documentation: `${mcpOrigin()}/docs/payload-mcp`,
  })
}

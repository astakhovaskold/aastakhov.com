import { getSiteUrl } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export function GET() {
  const siteUrl = getSiteUrl()

  return Response.json(
    {
      name: 'aastakhov.com',
      documentation: `${siteUrl}/llms.txt`,
      endpoints: [
        {
          type: 'mcp',
          url: `${siteUrl}/api/mcp`,
          auth: 'oauth2-or-bearer',
          description: 'Model Context Protocol server for site content management and reading.',
        },
        {
          type: 'webmcp',
          url: `${siteUrl}/api/webmcp/search`,
          auth: 'none',
          description: 'Public read-only search over published articles, projects and CV.',
        },
      ],
      content: {
        llms: `${siteUrl}/llms.txt`,
        llmsFull: `${siteUrl}/llms-full.txt`,
        sitemap: `${siteUrl}/sitemap.xml`,
        markdown: 'Append .md to any article or project URL.',
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } },
  )
}

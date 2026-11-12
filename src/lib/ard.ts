/**
 * Agentic Resource Discovery manifest (served at /.well-known/ard.json, and at the deprecated
 * /.well-known/ai-catalog.json). Format as validated by Lighthouse "Agentic Browsing":
 * `entries` is required; every entry needs `identifier` (urn:air:<publisher>:<namespace>:<name>),
 * `displayName`, a media `type`, and exactly one of `url` or inline `data`.
 * https://developer.chrome.com/docs/lighthouse/agentic-browsing/ard
 */
export function buildArdManifest(siteUrl: string) {
  return {
    entries: [
      {
        identifier: 'urn:air:aastakhov.com:docs:llms',
        displayName: 'aastakhov.com overview for LLMs',
        type: 'text/plain',
        url: `${siteUrl}/llms.txt`,
        representativeQueries: [
          'Who is Askold Astakhov?',
          'What frontend consulting does aastakhov.com offer?',
          'List the articles and projects on aastakhov.com',
        ],
      },
      {
        identifier: 'urn:air:aastakhov.com:tools:mcp',
        displayName: 'aastakhov.com MCP server',
        type: 'application/mcp-server-card+json',
        data: {
          name: 'aastakhov.com',
          description: 'Model Context Protocol server for reading and managing site content.',
          url: `${siteUrl}/api/mcp`,
          transport: 'streamable-http',
          authentication: 'oauth2-or-bearer',
        },
        representativeQueries: [
          'Read published posts from aastakhov.com',
          'Manage content on aastakhov.com through MCP',
        ],
        capabilities: ['content-read', 'content-write'],
      },
      {
        identifier: 'urn:air:aastakhov.com:tools:webmcp-search',
        displayName: 'aastakhov.com public search',
        type: 'application/json',
        data: {
          name: 'aastakhov.com public search',
          description: 'Public read-only search over published articles, projects and the CV.',
          url: `${siteUrl}/api/webmcp/search`,
          method: 'GET',
          parameters: ['q', 'locale', 'type', 'slug'],
          authentication: 'none',
        },
        representativeQueries: [
          'Search articles about frontend architecture',
          'Find the frontend technical audit article',
        ],
        capabilities: ['search'],
      },
    ],
  }
}

/** The deprecated ai-catalog.json keeps its original fields next to `entries`. */
export function buildLegacyAiCatalog(siteUrl: string) {
  return {
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
    ...buildArdManifest(siteUrl),
  }
}

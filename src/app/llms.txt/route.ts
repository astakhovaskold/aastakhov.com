import { buildLlmsTxt } from '@/lib/llms'
import { getPublishedPosts } from '@/lib/posts-index'
import { getPublishedProjects } from '@/lib/projects'
import { pageUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'
import { getSiteUrl } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export async function GET() {
  const siteUrl = getSiteUrl()
  const locales = ['ru', 'en'] as const
  const settings = await getSiteSettings('en')

  const [postsByLocale, projectsByLocale] = await Promise.all([
    Promise.all(locales.map((locale) => getPublishedPosts(locale))),
    Promise.all(locales.map((locale) => getPublishedProjects(locale))),
  ])

  const body = buildLlmsTxt({
    agentEndpoints: [
      { label: 'MCP server', url: `${siteUrl}/api/mcp` },
      { label: 'WebMCP search', url: `${siteUrl}/api/webmcp/search` },
      { label: 'Agent catalog', url: `${siteUrl}/.well-known/ard.json` },
    ],
    jobTitle: settings.jobTitle || '',
    locales: locales.map((locale) => ({
      cvUrl: pageUrl(locale, '/cv'),
      locale,
      postsUrl: pageUrl(locale, '/posts'),
      projectsUrl: pageUrl(locale, '/projects'),
    })),
    name: settings.name,
    posts: locales.flatMap((locale, i) =>
      postsByLocale[i].map((post) => ({
        description: post.description ?? '',
        publishedAt: post.publishedAt,
        title: `${post.title} (${locale})`,
        url: pageUrl(locale, `/posts/${post.slug}`),
      })),
    ),
    projects: locales.flatMap((locale, i) =>
      projectsByLocale[i].map((project) => ({
        description: project.description ?? '',
        title: `${project.title} (${locale})`,
        url: pageUrl(locale, `/projects/${project.slug}`),
      })),
    ),
    siteUrl,
    summary: settings.description || settings.seo.defaultDescription || '',
  })

  return new Response(body, {
    headers: {
      // s-maxage lets the Vercel edge serve a cached copy; without it every request rebuilds the file from the DB
      // and cold hits take seconds (PageSpeed timed out fetching llms.txt).
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

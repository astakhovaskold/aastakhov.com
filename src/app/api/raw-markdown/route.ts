import { buildMarkdownDocument } from '@/lib/llms'
import { getMarkdownDocument, isMarkdownLocale } from '@/lib/markdown-source'
import { handleCorsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

/** Target of the `/:locale/(posts|projects)/:slug.md` rewrites. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  // Under a rewrite `request.url` keeps the public path, so read it from there first.
  const fromPath = url.pathname.match(/^\/(ru|en)\/(posts|projects)\/(.+)\.md$/)
  const kind = (fromPath ? fromPath[2] === 'projects' : url.searchParams.get('kind') === 'project')
    ? 'project'
    : 'post'
  const locale = fromPath?.[1] ?? url.searchParams.get('locale') ?? ''
  const slug = decodeURIComponent(fromPath?.[3] ?? url.searchParams.get('slug') ?? '')
    .trim()
    .replace(/\.md$/, '')

  if (!isMarkdownLocale(locale) || !slug) {
    return withCors(new Response('Not found\n', { status: 404 }), request)
  }

  const doc = await getMarkdownDocument(kind, locale, slug)
  if (!doc) {
    return withCors(
      new Response('Not found\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        status: 404,
      }),
      request,
    )
  }

  return withCors(
    new Response(buildMarkdownDocument(doc), {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'Content-Type': 'text/markdown; charset=utf-8',
        Link: `<${doc.canonicalUrl}>; rel="canonical"`,
        'X-Robots-Tag': 'noindex',
      },
    }),
    request,
  )
}

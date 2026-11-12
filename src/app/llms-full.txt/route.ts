import { buildLlmsFullTxt } from '@/lib/llms'
import { getAllPostMarkdown } from '@/lib/markdown-source'
import { getSiteSettings } from '@/lib/siteSettings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [settings, documents] = await Promise.all([getSiteSettings('en'), getAllPostMarkdown()])

  return new Response(buildLlmsFullTxt({ documents, name: settings.name }), {
    headers: {
      // s-maxage lets the Vercel edge serve a cached copy; without it every request rebuilds the file from the DB
      // and cold hits take seconds (PageSpeed timed out fetching llms.txt).
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

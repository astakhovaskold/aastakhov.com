import { getSiteUrl } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.redirect(`${getSiteUrl()}/llms.txt`, 308)
}

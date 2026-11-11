import { getPayload } from 'payload'
import config from '@/payload.config'
import { handleCorsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || url.searchParams.get('query') || '').trim().toLowerCase()
  const locale = (url.searchParams.get('locale') || 'ru') as 'ru' | 'en'
  const type = (url.searchParams.get('type') || 'all').toLowerCase()
  const slug = (url.searchParams.get('slug') || '').trim()

  const payload = await getPayload({ config })
  const nowIso = new Date().toISOString()

  // If a specific article slug is requested, return the single article detail
  if (slug) {
    const postRes = await payload.find({
      collection: 'posts',
      locale,
      limit: 1,
      where: {
        and: [
          { slug: { equals: slug } },
          { publishedAt: { exists: true } },
          { publishedAt: { less_than_equal: nowIso } },
        ],
      },
    })

    const post = postRes.docs[0] as any
    if (!post) {
      return withCors(
        Response.json({ error: 'Article not found or not published' }, { status: 404 }),
        request,
      )
    }

    return withCors(
      Response.json({
        id: post.id,
        title: post.title || '',
        slug: post.slug || '',
        description: post.description || '',
        publishedAt: post.publishedAt || null,
        url: `/${locale}/posts/${post.slug || ''}`,
        content: post.content || null,
      }),
      request,
    )
  }

  const results: {
    posts: Array<{ id: number; title: string; description: string; slug: string; url: string; publishedAt: string | null }>
    projects: Array<{ id: number; title: string; description: string; slug: string; url: string }>
    openSource: Array<{ id: number; name: string; description: string; url: string }>
    cv?: Record<string, unknown>
  } = {
    posts: [],
    projects: [],
    openSource: [],
  }

  const tasks: Promise<void>[] = []

  if (type === 'all' || type === 'posts') {
    tasks.push(
      payload
        .find({
          collection: 'posts',
          locale,
          limit: 10,
          where: {
            and: [
              { publishedAt: { exists: true } },
              { publishedAt: { less_than_equal: nowIso } },
              ...(q
                ? [
                    {
                      or: [
                        { title: { like: q } },
                        { description: { like: q } },
                      ],
                    },
                  ]
                : []),
            ],
          },
        })
        .then((res) => {
          results.posts = res.docs.map((d: any) => ({
            id: d.id,
            title: d.title || '',
            description: d.description || '',
            slug: d.slug || '',
            url: `/${locale}/posts/${d.slug || ''}`,
            publishedAt: d.publishedAt || null,
          }))
        })
        .catch(() => {}),
    )
  }

  if (type === 'all' || type === 'projects') {
    tasks.push(
      payload
        .find({
          collection: 'projects',
          locale,
          limit: 10,
          where: {
            and: [
              { published: { equals: true } },
              ...(q
                ? [
                    {
                      or: [
                        { title: { like: q } },
                        { description: { like: q } },
                      ],
                    },
                  ]
                : []),
            ],
          },
        })
        .then((res) => {
          results.projects = res.docs.map((d: any) => ({
            id: d.id,
            title: d.title || '',
            description: d.description || '',
            slug: d.slug || '',
            url: `/${locale}/projects/${d.slug || ''}`,
          }))
        })
        .catch(() => {}),
    )
  }

  if (type === 'all' || type === 'opensource') {
    tasks.push(
      payload
        .find({
          collection: 'open-source',
          locale,
          limit: 10,
          where: q
            ? {
                or: [
                  { name: { like: q } },
                  { description: { like: q } },
                ],
              }
            : {},
        })
        .then((res) => {
          results.openSource = res.docs.map((d: any) => ({
            id: d.id,
            name: d.name || '',
            description: d.description || '',
            url: d.githubUrl || d.articleUrl || '',
          }))
        })
        .catch(() => {}),
    )
  }

  if (type === 'all' || type === 'cv') {
    tasks.push(
      payload
        .findGlobal({
          slug: 'cv',
          locale,
        })
        .then((cv: any) => {
          if (cv) {
            results.cv = {
              name: cv.name || '',
              role: cv.role || '',
              summary: cv.summary || '',
              location: cv.location || '',
              stack: cv.stack || [],
              experienceCount: cv.experience?.length || 0,
            }
          }
        })
        .catch(() => {}),
    )
  }

  await Promise.all(tasks)

  return withCors(
    Response.json({
      query: q,
      locale,
      type,
      count: results.posts.length + results.projects.length + results.openSource.length,
      results,
    }),
    request,
  )
}

import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

import { routing } from './i18n/routing'

const handleI18n = createMiddleware(routing)

function extractLocale(pathname: string): 'ru' | 'en' {
  if (pathname.startsWith('/en')) {
    return 'en'
  }
  return 'ru'
}

function isNotModified(ifModifiedSinceHeader: string | null, lastModified: Date): boolean {
  if (!ifModifiedSinceHeader) {
    return false
  }

  const ifModifiedSinceTime = new Date(ifModifiedSinceHeader).getTime()
  if (Number.isNaN(ifModifiedSinceTime)) {
    return false
  }

  // Compare in whole seconds because HTTP-date does not have milliseconds
  const ifModifiedSeconds = Math.floor(ifModifiedSinceTime / 1000)
  const lastModifiedSeconds = Math.floor(lastModified.getTime() / 1000)

  return ifModifiedSeconds >= lastModifiedSeconds
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Match /ru/posts/:slug or /en/posts/:slug or /posts/:slug (excluding category)
  const postDetailMatch = pathname.match(/^(?:\/(ru|en))?\/posts\/(?!category\/)([^/]+)$/)
  const isPostsIndex = /^(?:\/(ru|en))?\/posts\/?$/.test(pathname)

  if (postDetailMatch) {
    const locale = (postDetailMatch[1] as 'ru' | 'en' | undefined) || extractLocale(pathname)
    const slug = postDetailMatch[2]

    try {
      const url = new URL('/api/post-last-modified', request.url)
      url.searchParams.set('slug', slug)
      url.searchParams.set('locale', locale)

      const res = await fetch(url.toString(), {
        headers: {
          'x-internal-lookup': 'true',
        },
        next: { revalidate: 60 },
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.lastModified) {
          const lastModified = new Date(data.lastModified)
          if (!Number.isNaN(lastModified.valueOf())) {
            const lastModifiedGmt = lastModified.toUTCString()
            const ifModifiedSince = request.headers.get('if-modified-since')

            if (isNotModified(ifModifiedSince, lastModified)) {
              return new NextResponse(null, {
                status: 304,
                headers: {
                  'Last-Modified': lastModifiedGmt,
                },
              })
            }

            const response = handleI18n(request)
            response.headers.set('Last-Modified', lastModifiedGmt)
            return response
          }
        }
      }
    } catch {
      // Fallback to normal response
    }
  } else if (isPostsIndex) {
    const locale = extractLocale(pathname)

    try {
      const url = new URL('/api/post-last-modified', request.url)
      url.searchParams.set('locale', locale)

      const res = await fetch(url.toString(), {
        headers: {
          'x-internal-lookup': 'true',
        },
        next: { revalidate: 60 },
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.lastModified) {
          const lastModified = new Date(data.lastModified)
          if (!Number.isNaN(lastModified.valueOf())) {
            const lastModifiedGmt = lastModified.toUTCString()
            const ifModifiedSince = request.headers.get('if-modified-since')

            if (isNotModified(ifModifiedSince, lastModified)) {
              return new NextResponse(null, {
                status: 304,
                headers: {
                  'Last-Modified': lastModifiedGmt,
                },
              })
            }

            const response = handleI18n(request)
            response.headers.set('Last-Modified', lastModifiedGmt)
            return response
          }
        }
      }
    } catch {
      // Fallback to normal response
    }
  }

  return handleI18n(request)
}

export const config = {
  // OAuth endpoints are protocol URLs, not localized pages. Prefixing them
  // with /ru or /en breaks the exact redirect URI registered by ChatGPT.
  matcher: ['/((?!admin|api|oauth|chatgpt|_next|_vercel|.*\\..*).*)'],
}

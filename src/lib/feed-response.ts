import { getPublishedPosts } from '@/lib/posts-index'
import { generateRssFeed } from '@/lib/rss'
import { pageUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/siteSettings'

export type FeedLocale = 'en' | 'ru'

export async function buildFeedResponse(locale: FeedLocale): Promise<Response> {
  const [settings, posts] = await Promise.all([getSiteSettings(locale), getPublishedPosts(locale)])

  const xml = generateRssFeed({
    description: settings.blogPage.description,
    items: posts.map((post) => ({
      description: post.description,
      link: pageUrl(locale, `/posts/${post.slug}`),
      pubDate: post.publishedAt,
      title: post.title,
    })),
    language: locale,
    link: pageUrl(locale, '/posts'),
    selfLink: pageUrl(locale, '/feed.xml'),
    title: `${settings.blogPage.title} — ${settings.name}`,
  })

  return new Response(xml, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}

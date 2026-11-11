import config from '@payload-config'
import { getPayload } from 'payload'

import { type PostListItem, getPublishedPosts, toPostListItem } from '@/lib/posts-index'
import { orderMorePosts, selectTopicsWithPosts, splitTopicPosts } from '@/lib/topic-order'
import type { Post, Topic } from '@/payload-types'

export type TopicSummary = {
  description: null | string
  id: number
  pillarId: null | number
  slug: string
  title: string
}

export type TopicPageData = {
  pillar: null | PostListItem
  posts: PostListItem[]
  topic: TopicSummary
}

export type PostMoreData = {
  isPillar: boolean
  more: PostListItem[]
  pillar: null | PostListItem
  topic: null | TopicSummary
}

const MORE_LIMIT = 4

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function publicPostsWhere() {
  return [
    { publishedAt: { exists: true } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
  ]
}

function relationId(value: unknown): null | number {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

function toTopicSummary(topic: Topic): TopicSummary {
  return {
    description: topic.description || null,
    id: topic.id,
    pillarId: relationId(topic.pillar),
    slug: topic.slug,
    title: topic.title,
  }
}

async function findPublicTopicPosts(
  topicId: number,
  locale: string,
  fallbackLocale: 'ru' | false = 'ru',
): Promise<Post[]> {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    locale: locale as 'en' | 'ru',
    fallbackLocale,
    sort: '-publishedAt',
    where: { and: [...publicPostsWhere(), { topic: { equals: topicId } }] },
  })

  return posts.docs
}

/** Topics that have at least one public post. Used by the home page and the sitemap. */
export async function getTopicsWithPosts(
  locale: string,
  options?: { fallbackLocale?: 'ru' | false },
): Promise<Array<TopicSummary & { postCount: number }>> {
  if (isBuildPhase()) return []

  const fallbackLocale = options?.fallbackLocale ?? 'ru'

  try {
    const payload = await getPayload({ config })
    const [topics, posts] = await Promise.all([
      payload.find({
        collection: 'topics',
        depth: 0,
        limit: 100,
        locale: locale as 'en' | 'ru',
        fallbackLocale,
        pagination: false,
        sort: 'title',
      }),
      payload.find({
        collection: 'posts',
        depth: 0,
        limit: 1000,
        locale: locale as 'en' | 'ru',
        fallbackLocale,
        pagination: false,
        select: { topic: true, title: true },
        where: { and: publicPostsWhere() },
      }),
    ])

    const postTopicIds = posts.docs.filter((post) => Boolean(post.title)).map((post) => relationId(post.topic))

    return selectTopicsWithPosts(topics.docs, postTopicIds).map((topic) => ({
      ...toTopicSummary(topic),
      postCount: topic.postCount,
    }))
  } catch {
    return []
  }
}

/** Hub data for one topic, or null when the topic is missing or has no public post. */
export async function getTopicPageData(locale: string, slug: string): Promise<null | TopicPageData> {
  if (isBuildPhase()) return null

  try {
    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'topics',
      depth: 0,
      limit: 1,
      locale: locale as 'en' | 'ru',
      fallbackLocale: 'ru',
      where: { slug: { equals: slug } },
    })
    const topicDoc = found.docs[0]

    if (!topicDoc) return null

    const posts = (await findPublicTopicPosts(topicDoc.id, locale)).map(toPostListItem)

    if (posts.length === 0) return null

    const topic = toTopicSummary(topicDoc)
    const { pillar, rest } = splitTopicPosts(posts, topic.pillarId)

    return { pillar, posts: rest, topic }
  } catch {
    return null
  }
}

function isPublicNow(post: Post): boolean {
  if (!post.publishedAt) return false
  const date = new Date(post.publishedAt)
  return !Number.isNaN(date.valueOf()) && date.getTime() <= Date.now()
}

/** Data for the "More" block of a post page: related, same topic, latest, plus pillar/spoke links. */
export async function getPostMoreData(post: Post, locale: string): Promise<PostMoreData> {
  const empty: PostMoreData = { isPillar: false, more: [], pillar: null, topic: null }

  if (isBuildPhase()) return empty

  try {
    const related = (post.relatedPosts ?? [])
      .filter((entry): entry is Post => typeof entry === 'object' && entry !== null)
      .filter((entry) => entry.id !== post.id && isPublicNow(entry))
      .map(toPostListItem)

    const topicDoc = typeof post.topic === 'object' && post.topic !== null ? post.topic : null
    const topic = topicDoc ? toTopicSummary(topicDoc) : null
    const topicPosts = topic
      ? (await findPublicTopicPosts(topic.id, locale)).map(toPostListItem)
      : []
    const { pillar } = splitTopicPosts(topicPosts, topic?.pillarId)
    const isPillar = Boolean(pillar && pillar.id === post.id)
    const latest = await getPublishedPosts(locale)
    const limit = isPillar ? Math.max(MORE_LIMIT, topicPosts.length) : MORE_LIMIT

    return {
      isPillar,
      more: orderMorePosts({
        currentId: post.id,
        latest,
        limit,
        related,
        sameTopic: topicPosts,
      }),
      pillar: isPillar ? null : pillar,
      topic,
    }
  } catch {
    return empty
  }
}

type WithId = { id: number }

/**
 * Orders the "More" list of a post page: explicit related posts first, then posts of the same topic,
 * then the latest posts. The current post and duplicates are dropped, and the list is cut at `limit`.
 */
export function orderMorePosts<T extends WithId>(input: {
  currentId: number
  latest: T[]
  limit: number
  related: T[]
  sameTopic: T[]
}): T[] {
  const seen = new Set<number>([input.currentId])
  const result: T[] = []

  for (const post of [...input.related, ...input.sameTopic, ...input.latest]) {
    if (seen.has(post.id)) continue
    seen.add(post.id)
    result.push(post)
    if (result.length >= input.limit) break
  }

  return result
}

/** Splits the public posts of a topic into the pillar (first) and the other posts. */
export function splitTopicPosts<T extends WithId>(
  posts: T[],
  pillarId: null | number | undefined,
): { pillar: null | T; rest: T[] } {
  const pillar = pillarId ? (posts.find((post) => post.id === pillarId) ?? null) : null

  return {
    pillar,
    rest: posts.filter((post) => post.id !== pillar?.id),
  }
}

/** Keeps only the topics that have a title and at least one public post, with their post counts. */
export function selectTopicsWithPosts<T extends WithId & { title?: null | string }>(
  topics: T[],
  postTopicIds: Array<null | number>,
): Array<T & { postCount: number }> {
  const counts = new Map<number, number>()

  for (const id of postTopicIds) {
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  return topics
    .filter((topic) => Boolean(topic.title) && (counts.get(topic.id) ?? 0) > 0)
    .map((topic) => ({ ...topic, postCount: counts.get(topic.id) ?? 0 }))
}

import type { Post } from '@/payload-types'

export type PostDateFields = Pick<Post, 'publishedAt'> & {
  lastModified?: string | null
  updatedAt?: string | null
}

/**
 * Returns the effective last modified Date for a post.
 * Priority:
 * 1. Explicitly configured manual lastModified date.
 * 2. System updatedAt date from Payload CMS.
 * 3. Publication date publishedAt.
 * 4. Fallback to current date.
 */
export function getPostLastModifiedDate(post: PostDateFields): Date {
  if (post.lastModified) {
    const manualDate = new Date(post.lastModified)
    if (!Number.isNaN(manualDate.valueOf())) {
      return manualDate
    }
  }

  if (post.updatedAt) {
    const updatedDate = new Date(post.updatedAt)
    if (!Number.isNaN(updatedDate.valueOf())) {
      return updatedDate
    }
  }

  if (post.publishedAt) {
    const publishedDate = new Date(post.publishedAt)
    if (!Number.isNaN(publishedDate.valueOf())) {
      return publishedDate
    }
  }

  return new Date()
}

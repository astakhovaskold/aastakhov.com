import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

import { revalidateAfterChange } from '@/hooks/revalidate'
import { SITEMAP_TAG, getRevalidationTargets } from '@/lib/revalidate'

beforeEach(() => {
  revalidatePath.mockReset()
  revalidateTag.mockReset()
})

describe('getRevalidationTargets', () => {
  it('covers the post, the posts index, the home page and the sitemap for a post', () => {
    const targets = getRevalidationTargets('post', ['new-slug', 'old-slug'])

    expect(targets.paths).toEqual(
      expect.arrayContaining([
        '/ru',
        '/en',
        '/ru/posts',
        '/en/posts',
        '/ru/posts/new-slug',
        '/en/posts/old-slug',
      ]),
    )
    expect(targets.tags).toContain(SITEMAP_TAG)
  })

  it('revalidates the topic hub by slug', () => {
    expect(getRevalidationTargets('topic', ['frontend']).paths).toContain('/en/topics/frontend')
  })

  it('does not duplicate or add empty slugs', () => {
    const paths = getRevalidationTargets('post', ['a', 'a', null, undefined]).paths

    expect(paths.filter((path) => path === '/ru/posts/a')).toHaveLength(1)
    expect(paths).not.toContain('/ru/posts/')
  })
})

describe('revalidateAfterChange hook', () => {
  it('invalidates the posts index and the sitemap tag when a post is published', async () => {
    const hook = revalidateAfterChange('post')

    await hook({
      collection: {} as never,
      context: {},
      data: {},
      doc: { slug: 'hello' },
      operation: 'update',
      previousDoc: { slug: 'hello' },
      req: {} as never,
    })

    expect(revalidatePath).toHaveBeenCalledWith('/ru/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/ru/posts/hello')
    expect(revalidateTag).toHaveBeenCalledWith(SITEMAP_TAG, 'max')
  })

  it('does nothing when revalidation is disabled in the context', async () => {
    await revalidateAfterChange('post')({
      collection: {} as never,
      context: { disableRevalidate: true },
      data: {},
      doc: { slug: 'hello' },
      operation: 'update',
      previousDoc: {},
      req: {} as never,
    })

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('does not throw outside a Next.js request', async () => {
    revalidatePath.mockImplementation(() => {
      throw new Error('Invariant: static generation store missing')
    })

    expect(() =>
      revalidateAfterChange('post')({
        collection: {} as never,
        context: {},
        data: {},
        doc: { slug: 'hello' },
        operation: 'create',
        previousDoc: {},
        req: {} as never,
      }),
    ).not.toThrow()
  })
})

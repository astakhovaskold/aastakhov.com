import { describe, expect, it } from 'vitest'

import { buildNavItems } from '@/lib/navigation'

describe('buildNavItems', () => {
  it('links projects, posts and the CV when every section has items', () => {
    expect(buildNavItems({ posts: 3, projects: 2 }).map((item) => item.key)).toEqual([
      'projects',
      'posts',
      'cv',
    ])
  })

  it('omits projects when none is public', () => {
    expect(buildNavItems({ posts: 3, projects: 0 }).map((item) => item.key)).toEqual(['posts', 'cv'])
  })

  it('omits posts when none is public and always keeps the CV', () => {
    expect(buildNavItems({ posts: 0, projects: 0 }).map((item) => item.key)).toEqual(['cv'])
  })
})

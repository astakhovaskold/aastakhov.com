import type { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      homeEyebrow: siteSettings.homeEyebrow || 'Madrid · Available for selected projects',
      postsEyebrow: siteSettings.postsEyebrow || 'Writing and notes',
      projectsEyebrow: siteSettings.projectsEyebrow || 'Projects index',
    },
    req,
  })

  const cv = await payload.findGlobal({ slug: 'cv', depth: 0, req })

  await payload.updateGlobal({
    slug: 'cv',
    data: {
      eyebrow: cv.eyebrow || 'CV · Online resume',
    },
    req,
  })

  const [projects, posts, categories] = await Promise.all([
    payload.find({ collection: 'projects', depth: 0, pagination: false, req }),
    payload.find({ collection: 'posts', depth: 0, pagination: false, req }),
    payload.find({ collection: 'post-categories', depth: 0, pagination: false, req }),
  ])

  await Promise.all([
    ...projects.docs
      .filter((project) => !project.eyebrow)
      .map((project) =>
        payload.update({
          collection: 'projects',
          id: project.id,
          data: { eyebrow: 'Project detail' },
          req,
        }),
      ),
    ...posts.docs
      .filter((post) => !post.eyebrow)
      .map((post) =>
        payload.update({
          collection: 'posts',
          id: post.id,
          data: { eyebrow: 'Post detail' },
          req,
        }),
      ),
    ...categories.docs
      .filter((category) => !category.eyebrow)
      .map((category) =>
        payload.update({
          collection: 'post-categories',
          id: category.id,
          data: { eyebrow: 'Posts category' },
          req,
        }),
      ),
  ])
}

export async function down(): Promise<void> {
  // Eyebrow fields are optional and user-editable; do not remove their content on rollback.
}

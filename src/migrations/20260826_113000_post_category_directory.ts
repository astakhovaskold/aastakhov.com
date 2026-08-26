import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

const legacyCategories = [
  {
    description: 'Writing on product building, software delivery, and technical judgment.',
    legacyValue: 'article',
    order: 10,
    singularLabel: 'Article',
    slug: 'articles',
    title: 'Articles',
  },
  {
    description: 'Technical notes based on real product, architecture and delivery problems.',
    legacyValue: 'case',
    order: 20,
    singularLabel: 'Case note',
    slug: 'cases',
    title: 'Case notes',
  },
  {
    description: 'Short technical notes, observations, and implementation details.',
    legacyValue: 'note',
    order: 30,
    singularLabel: 'Note',
    slug: 'notes',
    title: 'Notes',
  },
  {
    description: 'Practical guides for shipping, debugging, and making technical decisions.',
    legacyValue: 'guide',
    order: 40,
    singularLabel: 'Guide',
    slug: 'guides',
    title: 'Guides',
  },
  {
    description: 'Broader essays on product, systems, and working methods.',
    legacyValue: 'essay',
    order: 50,
    singularLabel: 'Essay',
    slug: 'essays',
    title: 'Essays',
  },
] as const

type LegacyCategoryValue = (typeof legacyCategories)[number]['legacyValue']

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const categoryIdsByLegacyValue = new Map<LegacyCategoryValue, number>()

  for (const category of legacyCategories) {
    const existing = await payload.find({
      collection: 'post-categories',
      depth: 0,
      limit: 1,
      pagination: false,
      req,
      where: {
        slug: {
          equals: category.slug,
        },
      },
    })

    const doc =
      existing.docs[0] ||
      (await payload.create({
        collection: 'post-categories',
        data: {
          description: category.description,
          order: category.order,
          showInPostsNavigation: true,
          singularLabel: category.singularLabel,
          slug: category.slug,
          title: category.title,
        },
        req,
      }))

    categoryIdsByLegacyValue.set(category.legacyValue, doc.id)
  }

  const result = await db.execute(
    sql`SELECT id, category::text AS legacy_category FROM posts WHERE post_category_id IS NULL AND category IS NOT NULL`,
  )

  for (const row of result.rows as Array<{ id: number; legacy_category: LegacyCategoryValue | null }>) {
    if (!row.legacy_category) {
      continue
    }

    const postCategoryId = categoryIdsByLegacyValue.get(row.legacy_category)

    if (!postCategoryId) {
      continue
    }

    await db.execute(
      sql`UPDATE posts SET post_category_id = ${postCategoryId} WHERE id = ${row.id}`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE posts SET post_category_id = NULL`)

  for (const category of legacyCategories) {
    await db.execute(sql`DELETE FROM post_categories WHERE slug = ${category.slug}`)
  }
}

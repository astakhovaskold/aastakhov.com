import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config.js'

/**
 * One-off: create the three broad topics and attach existing posts.
 * Dry run by default (reads only). Pass --apply to write. Idempotent: reruns update in place.
 * Writes outside a Next.js request do not purge the ISR cache; pages refresh within `revalidate`.
 */

type TopicPlan = {
  descriptionEn: string
  descriptionRu: string
  pillar?: string
  posts: string[]
  slug: string
  titleEn: string
  titleRu: string
}

const plans: TopicPlan[] = [
  {
    slug: 'frontend-architecture',
    titleRu: 'Архитектура фронтенда',
    titleEn: 'Frontend architecture',
    descriptionRu:
      'Как проектировать фронтенд, который выдерживает рост продукта: границы модулей, работа с данными, паттерны и разборы реальных систем.',
    descriptionEn:
      'How to design a frontend that survives product growth: module boundaries, data handling, patterns and breakdowns of real systems.',
    pillar: 'frontend-that-does-not-collapse',
    posts: [
      'frontend-that-does-not-collapse',
      'frontend-architecture-for-data-heavy-workflows',
      'react-protected',
    ],
  },
  {
    slug: 'quality-and-audits',
    titleRu: 'Качество и аудит',
    titleEn: 'Quality and audits',
    descriptionRu:
      'Технический аудит, скорость сборки и инженерные практики: что проверять, как измерять и что менять в первую очередь.',
    descriptionEn:
      'Technical audits, build speed and engineering practice: what to check, how to measure and what to change first.',
    posts: ['technical-audit-checklist', 'ci-runner-bottleneck-vite-migration'],
  },
  {
    slug: 'delivery-and-process',
    titleRu: 'Поставка и процессы',
    titleEn: 'Delivery and process',
    descriptionRu:
      'Релизы, CI/CD и командные практики, которые делают поставку предсказуемой и не держатся на героизме.',
    descriptionEn:
      'Releases, CI/CD and team practices that keep delivery predictable without relying on heroics.',
    pillar: 'delivery-without-heroism',
    posts: ['delivery-without-heroism', 'release-process-for-enterprise-frontend-team'],
  },
]

const apply = process.argv.includes('--apply')
const payload = await getPayload({ config })
const ctx = { disableRevalidate: !apply ? true : false }

async function postBySlug(slug: string) {
  const res = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: 'all',
  })
  const doc = res.docs[0]
  if (!doc) throw new Error(`post not found: ${slug}`)
  return doc
}

console.log(apply ? 'MODE: APPLY' : 'MODE: DRY RUN (no writes)')

for (const plan of plans) {
  const existing = await payload.find({
    collection: 'topics',
    where: { slug: { equals: plan.slug } },
    limit: 1,
    depth: 0,
    locale: 'ru',
    fallbackLocale: false,
  })
  let topic = existing.docs[0]
  const pillarId = plan.pillar ? (await postBySlug(plan.pillar)).id : undefined
  const posts = await Promise.all(plan.posts.map(postBySlug))

  console.log(`\n${plan.slug}: ${topic ? `exists id=${topic.id}` : 'will create'}`)
  console.log(`  pillar: ${plan.pillar ?? '-'}`)
  for (const p of posts) {
    const cur = typeof p.topic === 'object' && p.topic ? p.topic.id : p.topic
    console.log(`  post ${p.slug}: topic ${cur ?? 'none'} -> ${plan.slug}`)
  }

  if (!apply) continue

  if (!topic) {
    topic = await payload.create({
      collection: 'topics',
      locale: 'ru',
      context: ctx,
      data: {
        title: plan.titleRu,
        description: plan.descriptionRu,
        slug: plan.slug,
        generateSlug: false,
        ...(pillarId ? { pillar: pillarId } : {}),
      },
    })
  } else {
    topic = await payload.update({
      collection: 'topics',
      id: topic.id,
      locale: 'ru',
      context: ctx,
      data: {
        title: plan.titleRu,
        description: plan.descriptionRu,
        ...(pillarId ? { pillar: pillarId } : {}),
      },
    })
  }
  await payload.update({
    collection: 'topics',
    id: topic.id,
    locale: 'en',
    context: ctx,
    data: { title: plan.titleEn, description: plan.descriptionEn },
  })
  for (const p of posts) {
    await payload.update({
      collection: 'posts',
      id: p.id,
      // Post tags are localized and required, but several posts only have `en` tags; validating in `ru` would fail.
      locale: 'en',
      context: ctx,
      data: { topic: topic.id },
    })
  }
  console.log('  done')
}

process.exit(0)

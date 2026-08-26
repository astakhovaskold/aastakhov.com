import 'dotenv/config'

import config from './payload.config.js'
import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'

type SeedNode = {
  children?: SeedNode[]
  type: string
  version: number
  [key: string]: unknown
}

type SeedRichText = {
  root: {
    children: SeedNode[]
    direction: null
    format: ''
    indent: 0
    type: 'root'
    version: 1
  }
}

function text(value: string, format = 0): SeedNode {
  return {
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text: value,
    type: 'text',
    version: 1,
  }
}

function block(type: string, children: SeedNode[], properties: Record<string, unknown> = {}): SeedNode {
  return {
    children,
    direction: null,
    format: '',
    indent: 0,
    type,
    version: 1,
    ...properties,
  }
}

function paragraph(...parts: Array<SeedNode | string>): SeedNode {
  return block(
    'paragraph',
    parts.map((part) => (typeof part === 'string' ? text(part) : part)),
  )
}

function heading(value: string, tag: 'h2' | 'h3' = 'h2'): SeedNode {
  return block('heading', [text(value)], { tag })
}

function quote(value: string): SeedNode {
  return block('quote', [paragraph(value)])
}

function bulletList(...items: string[]): SeedNode {
  return block(
    'list',
    items.map((item, index) =>
      block('listitem', [paragraph(item)], {
        value: index + 1,
      }),
    ),
    {
      listType: 'bullet',
      start: 1,
      tag: 'ul',
    },
  )
}

function code(value: string): SeedNode {
  return block('code', [text(value)], { language: 'text' })
}

function richText(...children: SeedNode[]): SeedRichText {
  return {
    root: {
      children,
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

type SlugCollection = 'post-categories' | 'posts' | 'projects'
type SlugCollectionData<TSlug extends SlugCollection> = RequiredDataFromCollectionSlug<TSlug> & {
  slug: string
}
type SeedSlugDocument = { id: number; slug: string }

async function upsertBySlug<TSlug extends SlugCollection>(
  payload: Payload,
  collection: TSlug,
  data: SlugCollectionData<TSlug>,
): Promise<SeedSlugDocument> {
  const existing = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: data.slug,
      },
    },
  })

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection,
      data: data as never,
      id: existing.docs[0].id,
    })

    return updated as SeedSlugDocument
  }

  const created = await payload.create({
    collection,
    data,
  })

  return created as SeedSlugDocument
}

type OpenSourceSeed = RequiredDataFromCollectionSlug<'open-source'>

async function upsertOpenSource(payload: Payload, data: OpenSourceSeed) {
  const existing = await payload.find({
    collection: 'open-source',
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      name: {
        equals: data.name,
      },
    },
  })

  if (existing.docs[0]) {
    return payload.update({
      collection: 'open-source',
      data,
      id: existing.docs[0].id,
    })
  }

  return payload.create({
    collection: 'open-source',
    data,
  })
}

// Content is adapted from the approved HTML references in tasks/**/mockups:
// the Automatica detail, posts index/detail, home baseline, and CV mockups.
const categorySeeds: Array<SlugCollectionData<'post-categories'>> = [
  {
    description: 'Writing on product building, software delivery, and technical judgment.',
    order: 10,
    showInPostsNavigation: true,
    singularLabel: 'Article',
    slug: 'articles',
    title: 'Articles',
  },
  {
    description: 'Technical notes based on real product, architecture and delivery problems.',
    order: 20,
    showInPostsNavigation: true,
    singularLabel: 'Case note',
    slug: 'cases',
    title: 'Case notes',
  },
  {
    description: 'Short technical notes, observations, and implementation details.',
    order: 30,
    showInPostsNavigation: true,
    singularLabel: 'Note',
    slug: 'notes',
    title: 'Notes',
  },
  {
    description: 'Practical guides for shipping, debugging, and making technical decisions.',
    order: 40,
    showInPostsNavigation: true,
    singularLabel: 'Guide',
    slug: 'guides',
    title: 'Guides',
  },
  {
    description: 'Broader essays on product, systems, and working methods.',
    order: 50,
    showInPostsNavigation: true,
    singularLabel: 'Essay',
    slug: 'essays',
    title: 'Essays',
  },
]

const projectSeeds: Array<RequiredDataFromCollectionSlug<'projects'>> = [
  {
    content: richText(
      heading('What it is'),
      paragraph(
        'Automatica is an independent product and technical partnership for products, teams, and digital operations that need a clear technical direction.',
      ),
      heading('Why it exists'),
      paragraph(
        'Good engineering work starts by reducing uncertainty. Automatica connects architecture, delivery, and ongoing technical ownership instead of treating them as separate projects.',
      ),
      heading('Current directions'),
      bulletList(
        'Technical partnership for products, teams, and digital operations.',
        'Architecture and audits across code, infrastructure, integrations, and delivery processes.',
        'Development, integrations, automation, and controlled ongoing support.',
      ),
      heading('How it connects to this site'),
      paragraph(
        'This site is the public notebook for the same way of working: understand the system, make the boundaries explicit, and carry decisions through to a reliable release.',
      ),
      quote('First reduce uncertainty. Then accelerate delivery.'),
    ),
    description:
      'Independent product and technical partnership for architecture, audits, implementation, and ongoing ownership.',
    featured: true,
    focus: 'Technical partnership, architecture, development, and ongoing support',
    order: 10,
    published: true,
    role: 'Founder / Technical partner',
    slug: 'automatica',
    status: 'active',
    title: 'Automatica',
    type: 'company',
    year: 2026,
  },
  {
    content: richText(
      heading('What it is'),
      paragraph(
        'A personal website for a builder and technical partner. It brings together selected work, practical writing, open-source credibility, and a formal CV.',
      ),
      heading('Why it exists'),
      paragraph(
        'The goal is a useful, text-first place to explain how complex product and engineering problems are approached, without turning the work into an agency portfolio.',
      ),
      heading('Current directions'),
      bulletList(
        'Clear information architecture for projects, posts, and professional context.',
        'A maintainable publishing workflow backed by Payload.',
        'A high-contrast interface that keeps the content in focus.',
      ),
      code('content -> context -> decisions -> delivery'),
    ),
    description:
      'A text-first personal site for sharing projects, technical notes, and professional context.',
    featured: true,
    focus: 'Content-first publishing and maintainable web architecture',
    order: 20,
    published: true,
    role: 'Builder / Technical partner',
    slug: 'personal-website',
    status: 'active',
    title: 'Personal website',
    type: 'website',
    year: 2026,
  },
]

type PostCategorySlug = 'article' | 'case' | 'note'

type PostSeedDefinition = Omit<RequiredDataFromCollectionSlug<'posts'>, 'postCategory'> & {
  categorySlug: PostCategorySlug
  slug: string
}

const postSeeds: PostSeedDefinition[] = [
  {
    category: 'article',
    categorySlug: 'article',
    content: richText(
      heading('Boundaries before abstractions'),
      paragraph(
        'UI components should not know transport details. API DTOs should not leak across the whole application. Permissions should be explicit and reusable.',
      ),
      bulletList(
        'Keep transport and domain boundaries visible.',
        'Make loading and error states part of the shared contract.',
        'Prefer repeatable patterns over local cleverness.',
      ),
      heading('Contracts are part of product quality'),
      paragraph(
        'Good architecture reduces the number of decisions a team has to remake every week. It gives delivery a stable shape while the product continues to change.',
      ),
      heading('Design for operations'),
      paragraph(
        'The architecture is useful only when it makes releases, debugging, and future changes easier for the team operating the product.',
      ),
    ),
    description: 'About layers, boundaries, data contracts, and repeatable implementation patterns.',
    featured: true,
    language: 'en',
    publishedAt: '2026-08-20T09:00:00.000Z',
    readingTime: 8,
    relatedProjects: [],
    showOnHome: true,
    slug: 'frontend-that-does-not-collapse',
    tags: [{ tag: 'architecture' }, { tag: 'frontend' }, { tag: 'boundaries' }],
    title: 'How to design frontend that does not collapse as product grows',
  },
  {
    category: 'article',
    categorySlug: 'article',
    content: richText(
      heading('Delivery without heroism'),
      paragraph(
        'Predictable releases come from visible dependencies, realistic readiness checks, and clear technical ownership before production.',
      ),
      heading('Make the release legible'),
      paragraph(
        'Task decomposition, QA loops, environments, and post-release support are part of the engineering system, not administrative overhead.',
      ),
      bulletList(
        'Track dependencies before they become blockers.',
        'Define what ready means for the team and the product.',
        'Keep release visibility shared between engineering, QA, and product.',
      ),
    ),
    description: 'Dependencies, release readiness, QA loops, and technical ownership before production.',
    featured: false,
    language: 'en',
    publishedAt: '2026-08-18T09:00:00.000Z',
    readingTime: 6,
    relatedProjects: [],
    showOnHome: true,
    slug: 'delivery-without-heroism',
    tags: [{ tag: 'delivery' }, { tag: 'releases' }],
    title: 'Delivery without heroism',
  },
  {
    category: 'case',
    categorySlug: 'case',
    content: richText(
      heading('The problem'),
      paragraph(
        'Data-heavy workflows make weak boundaries visible quickly: UI state, API contracts, permissions, and loading behavior start to compete for ownership.',
      ),
      heading('The approach'),
      paragraph(
        'Start with the user workflow and the data contract. Then define module boundaries, predictable state transitions, and a small set of patterns the team can repeat.',
      ),
      bulletList(
        'Separate transport details from UI components.',
        'Treat permissions and error states as explicit product behavior.',
        'Use shared patterns for tables, forms, filters, and asynchronous data.',
      ),
      heading('The outcome'),
      paragraph(
        'The interface becomes easier to extend because the next feature is added to a system of boundaries instead of another isolated implementation.',
      ),
    ),
    description: 'A technical note on interfaces, API contracts, and state boundaries in complex products.',
    featured: true,
    language: 'en',
    publishedAt: '2026-08-15T09:00:00.000Z',
    readingTime: 5,
    relatedProjects: [],
    showOnHome: true,
    slug: 'frontend-architecture-for-data-heavy-workflows',
    tags: [{ tag: 'case note' }, { tag: 'architecture' }],
    title: 'Frontend architecture for data-heavy workflows',
  },
  {
    category: 'case',
    categorySlug: 'case',
    content: richText(
      heading('The problem'),
      paragraph(
        'An enterprise frontend can have capable people and still release unpredictably when dependencies, grooming, QA, and ownership remain implicit.',
      ),
      heading('The approach'),
      paragraph(
        'Make the path to production visible: decompose work, surface dependencies, define readiness, and create a shared release rhythm.',
      ),
      heading('The outcome'),
      paragraph(
        'The team gets more control over delivery without relying on last-minute heroics or one person holding the whole system in their head.',
      ),
      quote('Release visibility is a technical control, not a reporting exercise.'),
    ),
    description: 'How task decomposition, grooming, and release visibility change delivery control.',
    featured: false,
    language: 'en',
    publishedAt: '2026-08-12T09:00:00.000Z',
    readingTime: 6,
    relatedProjects: [],
    showOnHome: true,
    slug: 'release-process-for-enterprise-frontend-team',
    tags: [{ tag: 'case note' }, { tag: 'delivery' }],
    title: 'Release process for an enterprise frontend team',
  },
  {
    category: 'note',
    categorySlug: 'note',
    content: richText(
      heading('Start with the failure surface'),
      paragraph(
        'A useful technical audit begins with the places where change is already expensive: unstable releases, unclear ownership, slow feedback, and repeated production incidents.',
      ),
      bulletList(
        'Trace one critical workflow from UI to data source.',
        'Check loading, error, and permission states.',
        'Look for duplicated contracts and hidden dependencies.',
        'Separate urgent stabilization from longer-term architecture work.',
      ),
      paragraph(
        'The first output should be a clearer decision about what to fix now, what to measure, and what can safely wait.',
      ),
    ),
    description: 'What to inspect first when a product has delivery problems, unstable releases, or quality drift.',
    featured: false,
    language: 'en',
    publishedAt: '2026-08-10T09:00:00.000Z',
    readingTime: 4,
    relatedProjects: [],
    showOnHome: true,
    slug: 'technical-audit-checklist',
    tags: [{ tag: 'audit' }, { tag: 'quality' }],
    title: 'Technical audit checklist',
  },
]

const openSourceSeeds: OpenSourceSeed[] = [
  {
    articleUrl: '/posts/frontend-that-does-not-collapse',
    description: 'A public set of engineering agreements for keeping frontend systems understandable as they grow.',
    featured: true,
    githubUrl: 'https://github.com/askold-astakhov/engineering-manifesto',
    name: 'engineering-manifesto',
    order: 10,
    stars: 18,
  },
  {
    description: 'Small libraries, templates, and implementation notes extracted from real product work.',
    featured: true,
    githubUrl: 'https://github.com/askold-astakhov/frontend-boundaries',
    name: 'frontend-boundaries',
    order: 20,
    stars: 7,
  },
]

const siteSettingsSeed = {
  availability: 'Available for selected projects',
  email: 'astakhovaskold@gmail.com',
  github: 'https://github.com/askold-astakhov',
  homeEyebrow: 'Madrid · Available for selected projects',
  linkedin: 'https://www.linkedin.com/in/askold-astakhov/',
  location: 'Madrid',
  name: 'Askold Astakhov',
  postsEyebrow: 'Writing and notes',
  projectsEyebrow: 'Projects index',
  seo: {
    defaultDescription: 'Personal site for Askold Astakhov.',
    defaultTitle: 'Askold Astakhov',
  },
  telegram: 'https://t.me/askold_astakhov',
}

const cvSeed = {
  eyebrow: 'CV · Online resume',
  expertise: [
    {
      description: 'Application structure, feature patterns, state and data boundaries, roles and access, UI components, and strict typing.',
      title: 'Frontend architecture',
    },
    {
      description: 'Render profiling, state and request optimization, Core Web Vitals, INP, CLS, SEO, accessibility, and stable layouts.',
      title: 'Performance and web quality',
    },
    {
      description: 'Task decomposition, estimation, dependency management, release branches, QA readiness, and post-release support.',
      title: 'Delivery and releases',
    },
    {
      description: 'API contracts, BFF approach, Node.js, NestJS, PostgreSQL, Strapi, Docker, and GitHub Actions.',
      title: 'Integrations and backend context',
    },
  ],
  expertiseNote: 'Technical leadership across frontend architecture, product delivery, and engineering quality.',
  experience: [
    {
      company: 'Философия.ИТ',
      current: true,
      highlights: [
        { text: 'Built frontend architecture as a system: application structure, state and data rules, loading and error patterns, and roles and access.' },
        { text: 'Managed delivery from the frontend side: decomposition, estimation, dependencies, release management, and readiness control.' },
        { text: 'Led hiring, technical interviews, onboarding, regular 1:1s, and performance reviews.' },
      ],
      location: 'Saint Petersburg · Remote',
      role: 'Frontend Tech Lead / Team Lead',
      stack: 'React, TypeScript, Next.js, Ant Design, Zustand, Docker, GitHub Actions',
      startDate: '2024-08-01T00:00:00.000Z',
      summary: 'Direct manager of a frontend team up to 8 people, responsible for frontend direction across a portfolio of projects.',
    },
    {
      company: 'Тектус.ИТ',
      current: false,
      endDate: '2024-08-01T00:00:00.000Z',
      highlights: [
        { text: 'Migrated frontend foundations from JavaScript to TypeScript and unified domain typing and data contracts.' },
        { text: 'Standardized data-layer patterns for loading, cache, invalidation, statuses, and error handling.' },
        { text: 'Implemented shared caching for multiple Next.js instances through Redis with TTL and on-demand revalidation.' },
      ],
      location: 'Saint Petersburg · Remote',
      role: 'Senior Frontend Engineer / Frontend Lead',
      stack: 'React, TypeScript, Redux Toolkit, TanStack Query, React Native, Ant Design, Effector, Docker',
      startDate: '2023-04-01T00:00:00.000Z',
      summary: 'Led frontend work across several projects, owned critical defects and architectural decisions as a hands-on engineer.',
    },
    {
      company: 'Элемент',
      current: false,
      endDate: '2023-04-01T00:00:00.000Z',
      highlights: [
        { text: 'Built Next.js projects with a focus on SEO, accessibility, and Core Web Vitals.' },
        { text: 'Implemented data visualization with synchronized 2D map and 3D object placement views.' },
        { text: 'Introduced Playwright smoke e2e checks for critical user flows.' },
      ],
      location: 'Saint Petersburg',
      role: 'Frontend Engineer → Principal Frontend Engineer',
      stack: 'React, TypeScript, Next.js, Vite, Node.js, NestJS, PostgreSQL, Strapi, ECharts, Leaflet, Jest, Playwright, Docker',
      startDate: '2021-10-01T00:00:00.000Z',
      summary: 'Grew into a leading frontend role, taking complex tasks and helping the team deliver production-ready solutions.',
    },
    {
      company: 'Вебит / ИКС Мониторинг',
      current: false,
      endDate: '2021-10-01T00:00:00.000Z',
      highlights: [
        { text: 'Delivered commercial web projects, interfaces, integrations, support, and technical SEO improvements.' },
        { text: 'Built backend functionality on PHP/MySQL when custom logic had to stay close to the UI.' },
      ],
      location: 'Moscow / Tula',
      role: 'Fullstack Software Engineer',
      stack: 'React, Vue.js, Nuxt.js, PHP, JavaScript, HTML/CSS, MySQL, Docker',
      startDate: '2019-12-01T00:00:00.000Z',
      summary: 'Built a strong web craft base across client projects, support, semantics, and SEO-oriented development.',
    },
  ],
  focus: 'Frontend architecture, product delivery, and engineering quality',
  languages: [
    { language: 'English', level: 'Professional working proficiency' },
    { language: 'Russian', level: 'Native' },
  ],
  location: 'Madrid',
  name: 'Askold Astakhov',
  role: 'Builder and technical partner',
  skills: [
    {
      category: 'Frontend',
      items: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Next.js' }, { name: 'Vite' }, { name: 'Redux Toolkit' }, { name: 'TanStack Query' }, { name: 'Zustand' }, { name: 'Effector' }, { name: 'Ant Design' }],
    },
    {
      category: 'Testing',
      items: [{ name: 'Playwright' }, { name: 'Jest' }, { name: 'React Testing Library' }, { name: 'Smoke e2e flows' }, { name: 'PR checks' }],
    },
    {
      category: 'Backend and data',
      items: [{ name: 'Node.js' }, { name: 'NestJS' }, { name: 'PostgreSQL' }, { name: 'Strapi' }, { name: 'PHP' }, { name: 'MySQL' }, { name: 'API contracts' }, { name: 'BFF approach' }],
    },
    {
      category: 'Infrastructure',
      items: [{ name: 'Docker' }, { name: 'GitHub Actions' }, { name: 'Release environments' }, { name: 'Prometheus' }, { name: 'Grafana' }, { name: 'Basic observability' }],
    },
  ],
  stack: 'React, TypeScript, Next.js, Node.js, NestJS, PostgreSQL, Docker',
  summary: 'I build and lead pragmatic software for complex products: architecture, delivery, implementation, and technical ownership.',
}

const seedProjectSlugs = projectSeeds.map((project) => project.slug)
const seedPostSlugs = postSeeds.map((post) => post.slug)
const seedOpenSourceNames = openSourceSeeds.map((item) => item.name)

async function seedContent(payload: Payload): Promise<void> {
  const categories = await Promise.all(
    categorySeeds.map((category) => upsertBySlug(payload, 'post-categories', category)),
  )
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]))

  const projects = await Promise.all(
    projectSeeds.map((project) => upsertBySlug(payload, 'projects', project)),
  )
  const projectIds = new Map(projects.map((project) => [project.slug, project.id]))

  const posts = await Promise.all(
    postSeeds.map((post) => {
      const { categorySlug, ...data } = post
      const postCategory = categoryIds.get(`${categorySlug}s`)

      if (!postCategory) {
        throw new Error(`Missing post category for ${categorySlug}`)
      }

      return upsertBySlug(payload, 'posts', {
        ...data,
        postCategory,
        relatedProjects: projectIds.get('automatica') ? [projectIds.get('automatica')!] : [],
      })
    }),
  )
  const postIds = new Map(posts.map((post) => [post.slug, post.id]))

  const caseNoteIds = postSeeds
    .filter((post) => post.categorySlug === 'case')
    .map((post) => postIds.get(post.slug))
    .filter((id): id is number => typeof id === 'number')
  const writingIds = postSeeds
    .filter((post) => post.categorySlug !== 'case')
    .map((post) => postIds.get(post.slug))
    .filter((id): id is number => typeof id === 'number')

  const automatica = projectIds.get('automatica')
  if (!automatica) {
    throw new Error('Automatica project was not created')
  }

  await payload.update({
    collection: 'projects',
    data: {
      relatedWriting: writingIds,
      selectedCaseNotes: caseNoteIds,
    },
    id: automatica,
  })

  await Promise.all(openSourceSeeds.map((item) => upsertOpenSource(payload, item)))

  const casesCategory = categoryIds.get('cases')
  await payload.updateGlobal({
    data: {
      ...siteSettingsSeed,
      featuredPostsCategory: casesCategory,
    },
    slug: 'site-settings',
  })
  await payload.updateGlobal({
    data: cvSeed,
    slug: 'cv',
  })

  console.log(
    `Seeded ${projects.length} projects, ${posts.length} posts, ${openSourceSeeds.length} open-source items, and both globals.`,
  )
}

async function clearSeedContent(payload: Payload): Promise<void> {
  const posts = await payload.delete({
    collection: 'posts',
    where: {
      slug: {
        in: seedPostSlugs,
      },
    },
  })
  const projects = await payload.delete({
    collection: 'projects',
    where: {
      slug: {
        in: seedProjectSlugs,
      },
    },
  })
  const openSource = await payload.delete({
    collection: 'open-source',
    where: {
      name: {
        in: seedOpenSourceNames,
      },
    },
  })

  console.log(
    `Cleared ${posts.docs.length} posts, ${projects.docs.length} projects, and ${openSource.docs.length} open-source items. Categories and globals were kept.`,
  )
}

async function verifySeedContent(payload: Payload): Promise<void> {
  const [projects, posts, categories, openSource, siteSettings, cv] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      pagination: false,
      where: { slug: { in: seedProjectSlugs } },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      pagination: false,
      where: { slug: { in: seedPostSlugs } },
    }),
    payload.find({ collection: 'post-categories', depth: 0, limit: 100, pagination: false }),
    payload.find({
      collection: 'open-source',
      depth: 0,
      limit: 100,
      pagination: false,
      where: { name: { in: seedOpenSourceNames } },
    }),
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
    payload.findGlobal({ slug: 'cv', depth: 0 }),
  ])

  const postCategoryCounts = posts.docs.reduce<Record<string, number>>((counts, post) => {
    const category =
      typeof post.postCategory === 'object' && post.postCategory !== null
        ? post.postCategory.slug
        : 'unknown'
    counts[category] = (counts[category] ?? 0) + 1
    return counts
  }, {})
  const automatica = projects.docs.find((project) => project.slug === 'automatica')
  const featuredCategory =
    typeof siteSettings.featuredPostsCategory === 'object' && siteSettings.featuredPostsCategory !== null
      ? siteSettings.featuredPostsCategory.slug
      : null
  const checks = {
    categories: categories.docs.filter((category) =>
      categorySeeds.some((seed) => seed.slug === category.slug),
    ).length,
    cvExperience: cv.experience?.length ?? 0,
    cvSkills: cv.skills?.length ?? 0,
    openSource: openSource.docs.length,
    postCategoryCounts,
    posts: posts.docs.length,
    projectRelations: {
      relatedWriting: automatica?.relatedWriting?.length ?? 0,
      selectedCaseNotes: automatica?.selectedCaseNotes?.length ?? 0,
    },
    projects: projects.docs.length,
    siteSettings: {
      featuredPostsCategory: featuredCategory,
      name: siteSettings.name,
    },
  }

  const isValid =
    checks.categories === 5 &&
    checks.cvExperience > 0 &&
    checks.cvSkills > 0 &&
    checks.openSource === 2 &&
    checks.posts === 5 &&
    checks.postCategoryCounts.articles === 2 &&
    checks.postCategoryCounts.cases === 2 &&
    checks.postCategoryCounts.notes === 1 &&
    checks.projectRelations.relatedWriting === 3 &&
    checks.projectRelations.selectedCaseNotes === 2 &&
    checks.projects === 2 &&
    checks.siteSettings.featuredPostsCategory === 'cases'

  if (!isValid) {
    throw new Error(`Seed verification failed: ${JSON.stringify(checks)}`)
  }

  console.log(`Seed verification passed: ${JSON.stringify(checks)}`)
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  try {
    if (process.argv.includes('--clear')) {
      await clearSeedContent(payload)
    } else if (process.argv.includes('--verify')) {
      await verifySeedContent(payload)
    } else {
      await seedContent(payload)
    }
  } finally {
    await payload.destroy()
  }
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})

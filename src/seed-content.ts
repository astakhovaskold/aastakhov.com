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

function block(
  type: string,
  children: SeedNode[],
  properties: Record<string, unknown> = {},
): SeedNode {
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
  locale: 'en' | 'ru',
): Promise<SeedSlugDocument> {
  const existing = await payload.find({
    collection,
    depth: 0,
    locale,
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
      locale,
    })

    return updated as SeedSlugDocument
  }

  const created = await payload.create({
    collection,
    data,
    locale,
  })

  return created as SeedSlugDocument
}

type OpenSourceSeed = RequiredDataFromCollectionSlug<'open-source'>

async function upsertOpenSource(payload: Payload, data: OpenSourceSeed, locale: 'en' | 'ru') {
  const existing = await payload.find({
    collection: 'open-source',
    depth: 0,
    locale,
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
      locale,
    })
  }

  return payload.create({
    collection: 'open-source',
    data,
    locale,
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
    description:
      'About layers, boundaries, data contracts, and repeatable implementation patterns.',
    featured: true,
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
    description:
      'Dependencies, release readiness, QA loops, and technical ownership before production.',
    featured: false,
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
    description:
      'A technical note on interfaces, API contracts, and state boundaries in complex products.',
    featured: true,
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
    description:
      'How task decomposition, grooming, and release visibility change delivery control.',
    featured: false,
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
    description:
      'What to inspect first when a product has delivery problems, unstable releases, or quality drift.',
    featured: false,
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
    description:
      'A public set of engineering agreements for keeping frontend systems understandable as they grow.',
    featured: true,
    githubUrl: 'https://github.com/askold-astakhov/engineering-manifesto',
    name: 'engineering-manifesto',
    order: 10,
    stars: 18,
  },
  {
    description:
      'Small libraries, templates, and implementation notes extracted from real product work.',
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
  homePage: {
    heroDescription:
      'Technical partner for complex projects — architecture, audits, consulting and development. Enterprise background, pragmatic approach.',
    heroTags: [
      { title: 'Architecture' },
      { title: 'Audits' },
      { title: 'Technical consulting' },
      { title: 'Full-stack dev' },
      { title: 'Team lead' },
    ],
    heroTitleLine1: 'Independent',
    heroTitleLine2: 'IT expert',
  },
  blogPage: {
    description:
      'Writing, notes, case studies, and practical material on building digital products.',
    title: 'Blog',
  },
  projectsPage: {
    description:
      'Products, companies, websites, concepts, experiments, and future initiatives. This is an index of projects, not a client portfolio.',
    title: 'Projects',
  },
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
      description:
        'Application structure, feature patterns, state and data boundaries, roles and access, UI components, and strict typing.',
      title: 'Frontend architecture',
    },
    {
      description:
        'Render profiling, state and request optimization, Core Web Vitals, INP, CLS, SEO, accessibility, and stable layouts.',
      title: 'Performance and web quality',
    },
    {
      description:
        'Task decomposition, estimation, dependency management, release branches, QA readiness, and post-release support.',
      title: 'Delivery and releases',
    },
    {
      description:
        'API contracts, BFF approach, Node.js, NestJS, PostgreSQL, Strapi, Docker, and GitHub Actions.',
      title: 'Integrations and backend context',
    },
  ],
  expertiseNote:
    'Technical leadership across frontend architecture, product delivery, and engineering quality.',
  experience: [
    {
      company: 'Философия.ИТ',
      current: true,
      highlights: [
        {
          text: 'Built frontend architecture as a system: application structure, state and data rules, loading and error patterns, and roles and access.',
        },
        {
          text: 'Managed delivery from the frontend side: decomposition, estimation, dependencies, release management, and readiness control.',
        },
        {
          text: 'Led hiring, technical interviews, onboarding, regular 1:1s, and performance reviews.',
        },
      ],
      location: 'Saint Petersburg · Remote',
      role: 'Frontend Tech Lead / Team Lead',
      stack: 'React, TypeScript, Next.js, Ant Design, Zustand, Docker, GitHub Actions',
      startDate: '2024-08-01T00:00:00.000Z',
      summary:
        'Direct manager of a frontend team up to 8 people, responsible for frontend direction across a portfolio of projects.',
    },
    {
      company: 'Тектус.ИТ',
      current: false,
      endDate: '2024-08-01T00:00:00.000Z',
      highlights: [
        {
          text: 'Migrated frontend foundations from JavaScript to TypeScript and unified domain typing and data contracts.',
        },
        {
          text: 'Standardized data-layer patterns for loading, cache, invalidation, statuses, and error handling.',
        },
        {
          text: 'Implemented shared caching for multiple Next.js instances through Redis with TTL and on-demand revalidation.',
        },
      ],
      location: 'Saint Petersburg · Remote',
      role: 'Senior Frontend Engineer / Frontend Lead',
      stack:
        'React, TypeScript, Redux Toolkit, TanStack Query, React Native, Ant Design, Effector, Docker',
      startDate: '2023-04-01T00:00:00.000Z',
      summary:
        'Led frontend work across several projects, owned critical defects and architectural decisions as a hands-on engineer.',
    },
    {
      company: 'Элемент',
      current: false,
      endDate: '2023-04-01T00:00:00.000Z',
      highlights: [
        { text: 'Built Next.js projects with a focus on SEO, accessibility, and Core Web Vitals.' },
        {
          text: 'Implemented data visualization with synchronized 2D map and 3D object placement views.',
        },
        { text: 'Introduced Playwright smoke e2e checks for critical user flows.' },
      ],
      location: 'Saint Petersburg',
      role: 'Frontend Engineer → Principal Frontend Engineer',
      stack:
        'React, TypeScript, Next.js, Vite, Node.js, NestJS, PostgreSQL, Strapi, ECharts, Leaflet, Jest, Playwright, Docker',
      startDate: '2021-10-01T00:00:00.000Z',
      summary:
        'Grew into a leading frontend role, taking complex tasks and helping the team deliver production-ready solutions.',
    },
    {
      company: 'Вебит / ИКС Мониторинг',
      current: false,
      endDate: '2021-10-01T00:00:00.000Z',
      highlights: [
        {
          text: 'Delivered commercial web projects, interfaces, integrations, support, and technical SEO improvements.',
        },
        {
          text: 'Built backend functionality on PHP/MySQL when custom logic had to stay close to the UI.',
        },
      ],
      location: 'Moscow / Tula',
      role: 'Fullstack Software Engineer',
      stack: 'React, Vue.js, Nuxt.js, PHP, JavaScript, HTML/CSS, MySQL, Docker',
      startDate: '2019-12-01T00:00:00.000Z',
      summary:
        'Built a strong web craft base across client projects, support, semantics, and SEO-oriented development.',
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
      items: [
        { name: 'React' },
        { name: 'TypeScript' },
        { name: 'Next.js' },
        { name: 'Vite' },
        { name: 'Redux Toolkit' },
        { name: 'TanStack Query' },
        { name: 'Zustand' },
        { name: 'Effector' },
        { name: 'Ant Design' },
      ],
    },
    {
      category: 'Testing',
      items: [
        { name: 'Playwright' },
        { name: 'Jest' },
        { name: 'React Testing Library' },
        { name: 'Smoke e2e flows' },
        { name: 'PR checks' },
      ],
    },
    {
      category: 'Backend and data',
      items: [
        { name: 'Node.js' },
        { name: 'NestJS' },
        { name: 'PostgreSQL' },
        { name: 'Strapi' },
        { name: 'PHP' },
        { name: 'MySQL' },
        { name: 'API contracts' },
        { name: 'BFF approach' },
      ],
    },
    {
      category: 'Infrastructure',
      items: [
        { name: 'Docker' },
        { name: 'GitHub Actions' },
        { name: 'Release environments' },
        { name: 'Prometheus' },
        { name: 'Grafana' },
        { name: 'Basic observability' },
      ],
    },
  ],
  stack: 'React, TypeScript, Next.js, Node.js, NestJS, PostgreSQL, Docker',
  summary:
    'I build and lead pragmatic software for complex products: architecture, delivery, implementation, and technical ownership.',
}

// Localized fields are deliberately kept beside the English source copy. Shared
// IDs, URLs, dates, ordering, and relationships are supplied by the English pass.
const russianCategorySeeds = [
  {
    description: 'Материалы о создании продуктов, разработке ПО и инженерных решениях.',
    singularLabel: 'Статья',
    title: 'Статьи',
  },
  {
    description: 'Технические заметки о реальных проблемах продукта, архитектуры и поставки.',
    singularLabel: 'Разбор случая',
    title: 'Разборы случаев',
  },
  {
    description: 'Короткие технические заметки, наблюдения и детали реализации.',
    singularLabel: 'Заметка',
    title: 'Заметки',
  },
  {
    description: 'Практические руководства по выпуску, отладке и техническим решениям.',
    singularLabel: 'Руководство',
    title: 'Руководства',
  },
  {
    description: 'Большие эссе о продуктах, системах и способах работы.',
    singularLabel: 'Эссе',
    title: 'Эссе',
  },
] as const

const russianProjectSeeds = [
  {
    content: richText(
      heading('Что это'),
      paragraph(
        'Automatica — независимое продуктовое и техническое партнёрство для продуктов, команд и цифровых операций, которым нужно ясное техническое направление.',
      ),
      heading('Зачем это существует'),
      paragraph(
        'Хорошая инженерная работа начинается со снижения неопределённости. Automatica соединяет архитектуру, поставку и постоянную техническую ответственность вместо того, чтобы считать их отдельными проектами.',
      ),
      heading('Текущие направления'),
      bulletList(
        'Техническое партнёрство для продуктов, команд и цифровых операций.',
        'Архитектура и аудиты кода, инфраструктуры, интеграций и процессов поставки.',
        'Разработка, интеграции, автоматизация и управляемая постоянная поддержка.',
      ),
      heading('Связь с этим сайтом'),
      paragraph(
        'Этот сайт — публичный блокнот того же подхода: понять систему, явно обозначить границы и довести решения до надёжного релиза.',
      ),
      quote('Сначала снизить неопределённость. Затем ускорять поставку.'),
    ),
    description:
      'Независимое продуктовое и техническое партнёрство: архитектура, аудиты, реализация и постоянная ответственность.',
    focus: 'Техническое партнёрство, архитектура, разработка и постоянная поддержка',
    role: 'Основатель / технический партнёр',
    title: 'Automatica',
  },
  {
    content: richText(
      heading('Что это'),
      paragraph(
        'Личный сайт разработчика и технического партнёра. Здесь собраны избранные работы, практические тексты, вклад в open source и формальное резюме.',
      ),
      heading('Зачем это существует'),
      paragraph(
        'Цель — создать полезное, ориентированное на текст пространство, которое объясняет подход к сложным продуктовым и инженерным задачам, не превращая работу в портфолио агентства.',
      ),
      heading('Текущие направления'),
      bulletList(
        'Ясная информационная архитектура для проектов, статей и профессионального контекста.',
        'Поддерживаемый процесс публикации на базе Payload.',
        'Контрастный интерфейс, в котором главное — содержание.',
      ),
      code('контент -> контекст -> решения -> поставка'),
    ),
    description:
      'Личный сайт, ориентированный на текст: проекты, технические заметки и профессиональный контекст.',
    focus: 'Публикации, где содержание в центре, и поддерживаемая веб-архитектура',
    role: 'Разработчик / технический партнёр',
    title: 'Личный сайт',
  },
] as const

const russianPostSeeds = [
  {
    content: richText(
      heading('Границы важнее абстракций'),
      paragraph(
        'Компоненты UI не должны знать детали транспорта. API DTO не должны просачиваться во всё приложение. Права доступа должны быть явными и переиспользуемыми.',
      ),
      bulletList(
        'Держите границы транспорта и домена видимыми.',
        'Считайте состояния загрузки и ошибок частью общего контракта.',
        'Предпочитайте повторяемые паттерны локальной изобретательности.',
      ),
      heading('Контракты — часть качества продукта'),
      paragraph(
        'Хорошая архитектура сокращает число решений, которые команде приходится принимать заново каждую неделю. Она придаёт поставке устойчивую форму, пока продукт продолжает меняться.',
      ),
      heading('Проектируйте с учётом эксплуатации'),
      paragraph(
        'Архитектура полезна, только если команде проще выпускать изменения, отлаживать систему и развивать продукт.',
      ),
    ),
    description: 'О слоях, границах, контрактах данных и повторяемых паттернах реализации.',
    tags: [{ tag: 'архитектура' }, { tag: 'фронтенд' }, { tag: 'границы' }],
    title: 'Как спроектировать фронтенд, который не разваливается с ростом продукта',
  },
  {
    content: richText(
      heading('Поставка без героизма'),
      paragraph(
        'Предсказуемые релизы появляются благодаря видимым зависимостям, реалистичным проверкам готовности и ясной технической ответственности до выхода в продакшен.',
      ),
      heading('Сделайте релиз понятным'),
      paragraph(
        'Декомпозиция задач, циклы QA, окружения и поддержка после релиза — части инженерной системы, а не административная нагрузка.',
      ),
      bulletList(
        'Отслеживайте зависимости до того, как они станут блокерами.',
        'Договоритесь, что означает готовность для команды и продукта.',
        'Делайте статус релиза общим для разработки, QA и продукта.',
      ),
    ),
    description:
      'Зависимости, готовность к релизу, циклы QA и техническая ответственность перед продакшеном.',
    tags: [{ tag: 'поставка' }, { tag: 'релизы' }],
    title: 'Поставка без героизма',
  },
  {
    content: richText(
      heading('Проблема'),
      paragraph(
        'Процессы с большим объёмом данных быстро проявляют слабые границы: состояние UI, API-контракты, права доступа и поведение загрузки начинают конкурировать за ответственность.',
      ),
      heading('Подход'),
      paragraph(
        'Начните с пользовательского сценария и контракта данных. Затем определите границы модулей, предсказуемые переходы состояния и небольшой набор паттернов, которые команда сможет повторять.',
      ),
      bulletList(
        'Отделяйте детали транспорта от компонентов UI.',
        'Считайте права доступа и состояния ошибок явным поведением продукта.',
        'Используйте общие паттерны для таблиц, форм, фильтров и асинхронных данных.',
      ),
      heading('Результат'),
      paragraph(
        'Интерфейс легче расширять, потому что следующая функция добавляется в систему границ, а не как ещё одна изолированная реализация.',
      ),
    ),
    description:
      'Техническая заметка об интерфейсах, API-контрактах и границах состояния в сложных продуктах.',
    tags: [{ tag: 'разбор случая' }, { tag: 'архитектура' }],
    title: 'Фронтенд-архитектура для процессов с большим объёмом данных',
  },
  {
    content: richText(
      heading('Проблема'),
      paragraph(
        'В enterprise-фронтенде могут работать сильные специалисты, но релизы всё равно непредсказуемы, когда зависимости, уточнение задач, QA и ответственность остаются неявными.',
      ),
      heading('Подход'),
      paragraph(
        'Сделайте путь в продакшен видимым: декомпозируйте работу, проявляйте зависимости, определяйте готовность и создайте общий ритм релизов.',
      ),
      heading('Результат'),
      paragraph(
        'Команда получает больше контроля над поставкой, не полагаясь на авралы в последний момент или одного человека, который держит всю систему в голове.',
      ),
      quote('Видимость релиза — технический контроль, а не упражнение в отчётности.'),
    ),
    description:
      'Как декомпозиция задач, уточнение и видимость релиза меняют контроль над поставкой.',
    tags: [{ tag: 'разбор случая' }, { tag: 'поставка' }],
    title: 'Процесс релизов для enterprise-фронтенд-команды',
  },
  {
    content: richText(
      heading('Начните с поверхности отказов'),
      paragraph(
        'Полезный технический аудит начинается с мест, где изменения уже дороги: нестабильные релизы, неясная ответственность, медленная обратная связь и повторяющиеся инциденты в продакшене.',
      ),
      bulletList(
        'Проследите один критический сценарий от UI до источника данных.',
        'Проверьте состояния загрузки, ошибок и прав доступа.',
        'Ищите дублирующиеся контракты и скрытые зависимости.',
        'Отделите срочную стабилизацию от долгосрочной архитектурной работы.',
      ),
      paragraph(
        'Первым результатом должно стать более ясное решение: что исправить сейчас, что измерять и что можно безопасно отложить.',
      ),
    ),
    description:
      'Что проверять сначала, если у продукта проблемы с поставкой, нестабильные релизы или ухудшается качество.',
    tags: [{ tag: 'аудит' }, { tag: 'качество' }],
    title: 'Чек-лист технического аудита',
  },
] as const

const russianOpenSourceSeeds = [
  {
    description:
      'Публичный набор инженерных договорённостей, помогающих сохранять фронтенд-системы понятными по мере роста.',
    name: 'engineering-manifesto',
  },
  {
    description:
      'Небольшие библиотеки, шаблоны и заметки по реализации, выделенные из реальной продуктовой работы.',
    name: 'frontend-boundaries',
  },
] as const

const russianSiteSettingsSeed = {
  ...siteSettingsSeed,
  availability: 'Доступен для избранных проектов',
  homeEyebrow: 'Мадрид · Доступен для избранных проектов',
  location: 'Мадрид',
  homePage: {
    heroDescription:
      'Технический партнёр для сложных проектов: архитектура, аудиты, консалтинг и разработка. Enterprise-опыт, прагматичный подход.',
    heroTags: [
      { title: 'Архитектура' },
      { title: 'Аудиты' },
      { title: 'Технический консалтинг' },
      { title: 'Full-stack разработка' },
      { title: 'Тимлид' },
    ],
    heroTitleLine1: 'Независимый',
    heroTitleLine2: 'IT-эксперт',
  },
  blogPage: {
    description:
      'Статьи, заметки, разборы случаев и практические материалы о создании цифровых продуктов.',
    title: 'Блог',
  },
  projectsPage: {
    description:
      'Продукты, компании, сайты, концепты, эксперименты и будущие инициативы. Это индекс проектов, а не клиентское портфолио.',
    title: 'Проекты',
  },
  postsEyebrow: 'Статьи и заметки',
  projectsEyebrow: 'Индекс проектов',
  seo: {
    defaultDescription: 'Персональный сайт Аскольда Астахова.',
    defaultTitle: 'Аскольд Астахов',
  },
}

const russianCvSeed = {
  ...cvSeed,
  eyebrow: 'CV · Онлайн-резюме',
  expertise: [
    {
      description:
        'Структура приложений, паттерны функций, границы состояния и данных, роли и доступы, UI-компоненты и строгая типизация.',
      title: 'Фронтенд-архитектура',
    },
    {
      description:
        'Профилирование рендеринга, оптимизация состояния и запросов, Core Web Vitals, INP, CLS, SEO, доступность и стабильные лейауты.',
      title: 'Производительность и качество веба',
    },
    {
      description:
        'Декомпозиция задач, оценка, управление зависимостями, релизные ветки, готовность QA и поддержка после релиза.',
      title: 'Поставка и релизы',
    },
    {
      description:
        'API-контракты, подход BFF, Node.js, NestJS, PostgreSQL, Strapi, Docker и GitHub Actions.',
      title: 'Интеграции и backend-контекст',
    },
  ],
  expertiseNote:
    'Техническое лидерство на стыке фронтенд-архитектуры, поставки продукта и инженерного качества.',
  experience: [
    {
      ...cvSeed.experience[0],
      location: 'Санкт-Петербург · Удалённо',
      role: 'Frontend Tech Lead / Team Lead',
      summary:
        'Прямой руководитель фронтенд-команды до 8 человек, отвечающий за направление фронтенда в портфеле проектов.',
      highlights: [
        {
          text: 'Выстроил фронтенд-архитектуру как систему: структуру приложения, правила состояния и данных, паттерны загрузки и ошибок, роли и доступы.',
        },
        {
          text: 'Управлял поставкой со стороны фронтенда: декомпозицией, оценкой, зависимостями, релизами и контролем готовности.',
        },
        {
          text: 'Вёл найм, технические интервью, онбординг, регулярные 1:1 и оценку эффективности.',
        },
      ],
    },
    {
      ...cvSeed.experience[1],
      location: 'Санкт-Петербург · Удалённо',
      role: 'Senior Frontend Engineer / Frontend Lead',
      summary:
        'Руководил фронтенд-разработкой в нескольких проектах, как hands-on инженер отвечал за критические дефекты и архитектурные решения.',
      highlights: [
        {
          text: 'Перевёл базовые части фронтенда с JavaScript на TypeScript и унифицировал доменную типизацию и контракты данных.',
        },
        {
          text: 'Стандартизировал паттерны слоя данных для загрузки, кеша, инвалидации, статусов и обработки ошибок.',
        },
        {
          text: 'Внедрил общий кеш для нескольких экземпляров Next.js через Redis с TTL и ревалидацией по требованию.',
        },
      ],
    },
    {
      ...cvSeed.experience[2],
      location: 'Санкт-Петербург',
      role: 'Frontend Engineer → Principal Frontend Engineer',
      summary:
        'Вырос до ведущей роли во фронтенде: брал сложные задачи и помогал команде выпускать готовые к продакшену решения.',
      highlights: [
        { text: 'Создавал проекты на Next.js с фокусом на SEO, доступность и Core Web Vitals.' },
        {
          text: 'Реализовал визуализацию данных с синхронизированными 2D-картой и 3D-размещением объектов.',
        },
        {
          text: 'Внедрил Playwright smoke e2e-проверки для критических пользовательских сценариев.',
        },
      ],
    },
    {
      ...cvSeed.experience[3],
      location: 'Москва / Тула',
      role: 'Fullstack Software Engineer',
      summary:
        'Сформировал сильную базу веб-разработки на клиентских проектах, поддержке, семантике и SEO-ориентированной разработке.',
      highlights: [
        {
          text: 'Выпускал коммерческие веб-проекты, интерфейсы, интеграции, поддержку и улучшения технического SEO.',
        },
        {
          text: 'Разрабатывал backend-функциональность на PHP/MySQL, когда кастомная логика должна была оставаться рядом с UI.',
        },
      ],
    },
  ],
  focus: 'Фронтенд-архитектура, поставка продукта и инженерное качество',
  languages: [
    { language: 'Английский', level: 'Профессиональное рабочее владение' },
    { language: 'Русский', level: 'Родной' },
  ],
  location: 'Мадрид',
  role: 'Разработчик и технический партнёр',
  skills: [
    { ...cvSeed.skills[0], category: 'Фронтенд', items: cvSeed.skills[0].items },
    {
      ...cvSeed.skills[1],
      category: 'Тестирование',
      items: [
        { name: 'Playwright' },
        { name: 'Jest' },
        { name: 'React Testing Library' },
        { name: 'Smoke e2e-сценарии' },
        { name: 'PR-проверки' },
      ],
    },
    { ...cvSeed.skills[2], category: 'Backend и данные', items: cvSeed.skills[2].items },
    {
      ...cvSeed.skills[3],
      category: 'Инфраструктура',
      items: [
        { name: 'Docker' },
        { name: 'GitHub Actions' },
        { name: 'Окружения релизов' },
        { name: 'Prometheus' },
        { name: 'Grafana' },
        { name: 'Базовая наблюдаемость' },
      ],
    },
  ],
  summary:
    'Создаю и веду прагматичную разработку сложных продуктов: архитектура, поставка, реализация и техническая ответственность.',
}

const seedProjectSlugs = projectSeeds.map((project) => project.slug)
const seedPostSlugs = postSeeds.map((post) => post.slug)
const seedOpenSourceNames = openSourceSeeds.map((item) => item.name)

async function seedContent(payload: Payload): Promise<void> {
  const categories = await Promise.all(
    categorySeeds.map((category) => upsertBySlug(payload, 'post-categories', category, 'en')),
  )
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]))

  const projects = await Promise.all(
    projectSeeds.map((project) => upsertBySlug(payload, 'projects', project, 'en')),
  )
  const projectIds = new Map(projects.map((project) => [project.slug, project.id]))

  const posts = await Promise.all(
    postSeeds.map((post) => {
      const { categorySlug, ...data } = post
      const postCategory = categoryIds.get(`${categorySlug}s`)

      if (!postCategory) {
        throw new Error(`Missing post category for ${categorySlug}`)
      }

      return upsertBySlug(
        payload,
        'posts',
        {
          ...data,
          postCategory,
          relatedProjects: projectIds.get('automatica') ? [projectIds.get('automatica')!] : [],
        },
        'en',
      )
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
    locale: 'en',
  })

  const openSource = await Promise.all(
    openSourceSeeds.map((item) => upsertOpenSource(payload, item, 'en')),
  )

  await payload.updateGlobal({
    data: {
      ...siteSettingsSeed,
      selectedWork: [
        {
          caption: 'Architecture',
          post: postIds.get('frontend-architecture-for-data-heavy-workflows'),
        },
        {
          caption: 'Consulting',
          post: postIds.get('release-process-for-enterprise-frontend-team'),
        },
      ],
      services: [
        {
          description: 'Architecture, code quality, CI/CD, security, and performance.',
          title: 'Audit',
        },
        {
          description: 'Technical strategy, roadmaps, and technology selection.',
          title: 'Consulting',
        },
        {
          description: 'Custom modules, integrations, migrations, and automation.',
          title: 'Development',
        },
        {
          description: 'Ongoing product support, incidents, and improvements.',
          title: 'Support & retainer',
        },
      ],
    },
    locale: 'en',
    slug: 'site-settings',
  })
  await payload.updateGlobal({
    data: cvSeed,
    locale: 'en',
    slug: 'cv',
  })

  await Promise.all(
    categories.map((category, index) =>
      payload.update({
        collection: 'post-categories',
        data: { ...categorySeeds[index], ...russianCategorySeeds[index] } as never,
        id: category.id,
        locale: 'ru',
      }),
    ),
  )
  await Promise.all(
    projects.map((project, index) =>
      payload.update({
        collection: 'projects',
        data: { ...projectSeeds[index], ...russianProjectSeeds[index] } as never,
        id: project.id,
        locale: 'ru',
      }),
    ),
  )
  await Promise.all(
    posts.map((post, index) => {
      const { categorySlug: _categorySlug, ...data } = postSeeds[index]
      return payload.update({
        collection: 'posts',
        data: {
          ...data,
          ...russianPostSeeds[index],
          postCategory: categoryIds.get(`${postSeeds[index].categorySlug}s`),
          relatedProjects: projectIds.get('automatica') ? [projectIds.get('automatica')!] : [],
        } as never,
        id: post.id,
        locale: 'ru',
      })
    }),
  )
  await Promise.all(
    openSource.map((item, index) =>
      payload.update({
        collection: 'open-source',
        data: { ...openSourceSeeds[index], ...russianOpenSourceSeeds[index] } as never,
        id: item.id,
        locale: 'ru',
      }),
    ),
  )
  await payload.updateGlobal({
    data: {
      ...russianSiteSettingsSeed,
      selectedWork: [
        {
          caption: 'Архитектура',
          post: postIds.get('frontend-architecture-for-data-heavy-workflows'),
        },
        {
          caption: 'Консалтинг',
          post: postIds.get('release-process-for-enterprise-frontend-team'),
        },
      ],
      services: [
        {
          description: 'Архитектура, качество кода, CI/CD, безопасность и производительность.',
          title: 'Аудит',
        },
        {
          description: 'Техническая стратегия, дорожные карты и выбор технологий.',
          title: 'Консалтинг',
        },
        {
          description: 'Кастомные модули, интеграции, миграции и автоматизация.',
          title: 'Разработка',
        },
        {
          description: 'Постоянная поддержка продукта, инциденты и улучшения.',
          title: 'Поддержка и ретейнер',
        },
      ],
    },
    locale: 'ru',
    slug: 'site-settings',
  })
  await payload.updateGlobal({ data: russianCvSeed, locale: 'ru', slug: 'cv' })

  console.log(
    `Seeded ${projects.length} projects, ${posts.length} posts, ${openSourceSeeds.length} open-source items in en and ru, and both globals.`,
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

async function verifySeedLocale(payload: Payload, locale: 'en' | 'ru'): Promise<void> {
  const [projects, posts, categories, openSource, siteSettings, cv] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 1,
      fallbackLocale: false,
      limit: 100,
      locale,
      pagination: false,
      where: { slug: { in: seedProjectSlugs } },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      fallbackLocale: false,
      limit: 100,
      locale,
      pagination: false,
      where: { slug: { in: seedPostSlugs } },
    }),
    payload.find({
      collection: 'post-categories',
      depth: 0,
      fallbackLocale: false,
      limit: 100,
      locale,
      pagination: false,
    }),
    payload.find({
      collection: 'open-source',
      depth: 0,
      fallbackLocale: false,
      limit: 100,
      locale,
      pagination: false,
      where: { name: { in: seedOpenSourceNames } },
    }),
    payload.findGlobal({ slug: 'site-settings', depth: 1, fallbackLocale: false, locale }),
    payload.findGlobal({ slug: 'cv', depth: 0, fallbackLocale: false, locale }),
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
      heroTitle: siteSettings.homePage?.heroTitleLine1,
      name: siteSettings.name,
      selectedWork: siteSettings.selectedWork?.length ?? 0,
      services: siteSettings.services?.length ?? 0,
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
    checks.siteSettings.selectedWork === 2 &&
    checks.siteSettings.services === 4 &&
    Boolean(checks.siteSettings.heroTitle)

  if (!isValid) {
    throw new Error(`Seed verification failed for ${locale}: ${JSON.stringify(checks)}`)
  }

  console.log(`Seed verification passed for ${locale}: ${JSON.stringify(checks)}`)
}

async function verifySeedContent(payload: Payload): Promise<void> {
  await Promise.all([verifySeedLocale(payload, 'en'), verifySeedLocale(payload, 'ru')])
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

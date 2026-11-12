/**
 * Content decided by the owner for the SEO remediation (task 4.1):
 * location "Remote" without a city, role "Frontend Architect & Tech Lead" everywhere,
 * available for external projects, team size 6–8 (as in the EN CV), RU CV synced with EN.
 */

export const ROLE = 'Frontend Architect & Tech Lead'

type SettingsContent = {
  availability: string
  description: string
  homeEyebrow: string
  jobTitle: string
  location: string
  proof: Array<{ description: string; title: string }>
}

export const siteSettingsByLocale: Record<'en' | 'ru', SettingsContent> = {
  en: {
    availability: 'Available for external projects',
    description:
      'Frontend architect and tech lead. I design web platforms, set engineering standards and lead frontend teams of 6–8 engineers.',
    homeEyebrow: 'Remote · Available for external projects',
    jobTitle: ROLE,
    location: 'Remote',
    proof: [
      {
        description: 'Domain Driven Frontend and two production starter kits cut new project setup from 10 to 4 days.',
        title: '-60% project setup time',
      },
      {
        description: 'Median PR merge time went from 1.5 to 0.4 days.',
        title: 'PRs merge almost 4x faster',
      },
      {
        description: 'OpenAPI, generated TypeScript, mock servers and Zod validation at runtime.',
        title: '-78% contract-mismatch rejections',
      },
      {
        description: 'Render latency on tables with 1,000+ rows after TypeScript and server-side pagination.',
        title: '2.8s to 300ms',
      },
    ],
  },
  ru: {
    availability: 'Доступен для внешних проектов',
    description:
      'Frontend-архитектор и технический лидер. Проектирую веб-платформы, выстраиваю инженерные стандарты и руковожу frontend-командами из 6–8 инженеров.',
    homeEyebrow: 'Удалённо · Доступен для внешних проектов',
    jobTitle: ROLE,
    location: 'Удалённо',
    proof: [
      {
        description:
          'Domain Driven Frontend и два production-стартера сократили запуск нового проекта с 10 до 4 дней.',
        title: '−60% времени запуска проекта',
      },
      {
        description: 'Медианное время слияния PR сократилось с 1,5 до 0,4 дня.',
        title: 'PR сливаются почти в 4 раза быстрее',
      },
      {
        description: 'OpenAPI, генерация TypeScript, mock-серверы и runtime-валидация Zod.',
        title: '−78% возвратов из-за контрактов',
      },
      {
        description: 'Время отрисовки таблиц на 1000+ строк после TypeScript и серверной пагинации.',
        title: '2,8 с → 300 мс',
      },
    ],
  },
}

export const ALTERNATE_NAME = 'Аскольд Астахов'

export const KNOWS_ABOUT = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'NestJS',
  'Frontend architecture',
  'Web performance',
  'Micro-frontends',
  'OpenAPI',
  'Model Context Protocol (MCP)',
]

export type RuExperienceUpdate = {
  company: string
  highlights: string[]
  location: string
  role: string
  stack: string
  summary: string
}

export const ruCv = {
  expertise: [
    {
      description:
        'Проектирую и разрабатываю сложные веб-платформы, беру на себя трудные инженерные задачи и при необходимости работаю на стыке frontend, backend и инфраструктуры.',
      title: 'Разработка и архитектура',
    },
    {
      description:
        'Отвечаю за технические решения, инженерные стандарты, найм, развитие инженеров, декомпозицию и кросс-функциональную поставку в распределённых продуктовых командах.',
      title: 'Техническое руководство и поставка',
    },
  ],
  expertiseNote:
    'Совмещаю практическую разработку с архитектурой, поставкой и техническим руководством в enterprise-продуктах.',
  focus:
    'Архитектура frontend-приложений, производительность веба, интеграции, инженерные стандарты и техническое руководство',
  location: 'Удалённо',
  role: ROLE,
  stack: 'React, TypeScript, Next.js, Node.js, NestJS, OpenAPI, Redis, Module Federation, Rspack',
  summary:
    'Практикующий Frontend Tech Lead с опытом более 7 лет: проектирую устойчивые веб-платформы, выстраиваю инженерные стандарты и руковожу распределёнными frontend-командами из 6–8 инженеров. Специализируюсь на React, TypeScript и Next.js, фокусируюсь на производительности веба, архитектуре Domain-Driven Frontend и промышленных AI-интеграциях.',
} as const

export const ruExperience: RuExperienceUpdate[] = [
  {
    company: 'Philosophy.IT',
    highlights: [
      'Архитектура и стандарты: руководил frontend-разработкой в команде из 6–8 инженеров; разработал Domain Driven Frontend (DDF) и 2 production-стартера, сократив запуск нового проекта с 10 до 4 дней (−60%).',
      'Ускорение поставки и инструменты: сократил медианное время слияния PR с 1,5 до 0,4 дня за счёт децентрализации код-ревью и собственного дашборда метрик поставки на Electron/React.',
      'API-first и надёжность контрактов: внедрил спецификации OpenAPI, автоматическую генерацию TypeScript, mock-серверы и runtime-валидацию Zod, что снизило число возвратов задач из-за несовпадения контрактов на 78%.',
      'Enterprise AI и WebMCP: спроектировал промышленные LLM-функции, 4 MCP-инструмента и браузерный WebMCP для платформы обучения сотрудников на 240 тыс. пользователей, сократив время создания теста с 4–6 часов до менее чем 1 часа.',
    ],
    location: 'Удалённо',
    role: 'Frontend Tech Lead',
    stack: 'React, TypeScript, Next.js, Node.js, NestJS, Java, OpenAPI, Zod, Module Federation, Rspack, Electron, Docker',
    summary:
      'Пришёл в августе 2024 года как Lead Frontend Engineer, в январе 2025 года повышен до Frontend Tech Lead. Руковожу frontend-разработкой в консалтинговой компании на 47 инженеров, которая поставляет 6 enterprise B2B-продуктов в банкинге, промышленных MES и фармацевтике.',
  },
  {
    company: 'Tectus.IT',
    highlights: [
      'Вывод проекта из риска срыва: принял общенациональную платформу опросов с отставанием в 6 недель; ввёл еженедельные инкременты и демо для заказчика, поставил 100% объёма с итоговой задержкой всего в 1 неделю.',
      'Стабилизация кодовой базы и производительность: устранил технический долг и падения браузера на таблицах от 1000 строк; внедрил TypeScript и серверную пагинацию, сократив задержку отрисовки с 2,8 с до 300 мс.',
      'Модернизация сборки и запуск портала: перевёл проект с CRA на Vite, сократив сборку с ~4 минут до ~10 секунд; возглавил команду из 4 инженеров и за 2 недели запустил портал госуслуг для граждан.',
      'Поставка e-commerce и цифровых платформ: разработал full-stack платформу заказов на Next.js и Strapi с динамическим ценообразованием, оплатой через Stripe и интеграцией с POS, сократив TTFB с 2,3 с до 300 мс.',
    ],
    location: 'Удалённо',
    role: 'Senior Frontend Engineer / Team Lead',
    stack: 'React, TypeScript, Next.js, Strapi, Redis, Stripe, CI/CD, Storybook, Docusaurus',
    summary:
      'Совмещал разработку frontend, техническое руководство и кросс-функциональную поставку публичных веб-платформ, включая общенациональную платформу опросов и госсервисы для граждан.',
  },
  {
    company: 'Element',
    highlights: [
      'Web3 и e-commerce: разработал frontend и Node.js BFF для международного NFT-маркетплейса знаменитостей; интегрировал Phantom Wallet, конструктор страниц из 12 блоков и гибридное SSG/SSR-ценообразование.',
      'Данные в реальном времени и офлайн: разработал карты объектов на Leaflet и 3D-схемы хранилищ на ECharts с WebSockets и кешированием через Service Worker; создал мобильные веб-Stories с нагрузкой 900 RPS.',
      'Общие библиотеки: разработал внутренние NPM-библиотеки для декларативного контроля доступа RBAC/ABAC, предзагрузки данных и обновления токенов, которые используются в приложениях атомной энергетики.',
      'Инструменты разработчика и автоматизация: создал Node.js CLI-инструменты и скрипты автоматизации для генерации проектов и разбора документов, сэкономив повторяющиеся инженерные часы в нескольких командах.',
    ],
    location: 'Санкт-Петербург',
    role: 'Senior Frontend Engineer',
    stack: 'React, TypeScript, Next.js, Node.js, SvelteKit, NestJS, PostgreSQL, Prisma, MinIO, Leaflet, ECharts, WebSockets',
    summary:
      'Разрабатывал интерфейсы промышленного мониторинга, Web3-продукты и переиспользуемую frontend-инфраструктуру для нескольких продуктов компании.',
  },
  {
    company: 'Webit',
    highlights: [
      'Интерактивные визуализации и медиа: разработал собственные пространственные интерфейсы на HTML5 Canvas и 3D-виртуальные туры на krpano с отзывчивым сенсорным управлением во всех браузерах.',
      'Единая сессия между подсистемами: спроектировал единую аутентификацию и постоянные сессии для маркетинговых сайтов и закрытых личных кабинетов.',
    ],
    location: 'Москва',
    role: 'Web Engineer',
    stack: 'JavaScript, Vue.js, Nuxt.js, React, Canvas, krpano, JSON-LD, Core Web Vitals, SEO',
    summary:
      'Разрабатывал потребительские веб-платформы, клиентские порталы и интерактивные решения на Vue.js, Nuxt.js, React и Canvas с упором на структурированные данные, SEO и Core Web Vitals.',
  },
  {
    company: 'ICS Monitoring',
    highlights: [
      'Full-stack и унаследованные системы: реализовал функциональность от начала до конца в 30+ клиентских приложениях на PHP, MySQL, чистом JavaScript, Vue.js, Linux и Nginx.',
      'Инженерная модернизация: внедрил систему контроля версий Git и автоматизированные CI/CD-пайплайны в legacy-окружениях, улучшив производительность и техническое SEO.',
    ],
    location: 'Тула',
    role: 'Full-Stack Web Developer',
    stack: 'PHP, MySQL, JavaScript, Vue.js, Linux, Nginx, Git, CI/CD, MJML',
    summary:
      'Работал с кодовыми базами на PHP, MySQL, JavaScript, Vue.js, Linux и Nginx, поддерживая и расширяя унаследованные клиентские приложения.',
  },
  {
    company: 'Seoproduction',
    highlights: [
      'Поддерживал и расширял около 30 коммерческих веб-приложений на CMS-платформах и собственных кодовых базах.',
      'Внедрил систему контроля версий Git, автоматизированные CI/CD-пайплайны и улучшения производительности в legacy-окружениях.',
    ],
    location: 'Тула',
    role: 'Full-Stack Web Developer',
    stack: 'PHP, MySQL, JavaScript, Vue.js, Linux, Nginx, Git, CI/CD',
    summary:
      'Поддерживал и расширял около 30 коммерческих веб-приложений на CMS-платформах и собственных кодовых базах.',
  },
]

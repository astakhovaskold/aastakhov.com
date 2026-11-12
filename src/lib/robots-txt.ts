import {
  CONTENT_SIGNAL,
  PRIVATE_PATHS,
  PUBLIC_API_PATHS,
  SEARCH_AND_USER_AGENTS,
  TRAINING_CRAWLERS,
} from '@/lib/ai-policy'

export function buildRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '')
  const disallowPrivate = PRIVATE_PATHS.map((path) => `Disallow: ${path}`)
  const allowApi = PUBLIC_API_PATHS.map((path) => `Allow: ${path}`)
  const blocks: string[][] = []

  blocks.push([
    'User-agent: *',
    `Content-Signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    ...allowApi,
    ...disallowPrivate,
  ])

  for (const agent of SEARCH_AND_USER_AGENTS) {
    blocks.push([
      `User-agent: ${agent}`,
      `Content-Signal: ${CONTENT_SIGNAL}`,
      'Allow: /',
      ...allowApi,
      ...disallowPrivate,
    ])
  }

  for (const agent of TRAINING_CRAWLERS) {
    blocks.push([`User-agent: ${agent}`, `Content-Signal: ${CONTENT_SIGNAL}`, 'Disallow: /'])
  }

  return `${blocks.map((block) => block.join('\n')).join('\n\n')}\n\nSitemap: ${base}/sitemap.xml\n`
}

import { getTranslations } from 'next-intl/server'

import { createOgImage, ogContentType, ogSize } from '@/lib/og'
import { getProjectDetailBySlug } from '@/lib/project-detail'
import { isPubliclyIndexableEntity } from '@/lib/seo'

export const alt = 'Askold Astakhov project'
export const contentType = ogContentType
export const size = ogSize

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: 'en' | 'ru'; slug: string }> }) {
  const { locale, slug } = await params
  const [{ project }, t] = await Promise.all([
    getProjectDetailBySlug(slug, locale),
    getTranslations({ locale, namespace: 'projects' }),
  ])

  return createOgImage({
    description: project?.description || t('description'),
    kind: 'project',
    locale,
    title: project && isPubliclyIndexableEntity(project) ? project.title : t('title'),
  })
}

import { getTranslations } from 'next-intl/server'

import { createOgImage, ogContentType, ogSize } from '@/lib/og'
import { getPostCategoryBySlug, getPostCategoryLinks } from '@/lib/posts-index'

export const alt = 'Askold Astakhov topic'
export const contentType = ogContentType
export const size = ogSize

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: 'en' | 'ru'; slug: string }> }) {
  const { locale, slug } = await params
  const [categories, t] = await Promise.all([
    getPostCategoryLinks(locale, { includeHidden: true }),
    getTranslations({ locale, namespace: 'posts' }),
  ])
  const category = getPostCategoryBySlug(categories, slug)

  return createOgImage({
    description: category?.description || t('description'),
    kind: 'topic',
    locale,
    title: category?.label || t('title'),
  })
}

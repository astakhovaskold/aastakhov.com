import { getTranslations } from 'next-intl/server'

import { createOgImage, ogContentType, ogSize } from '@/lib/og'
import { getPostDetailBySlug } from '@/lib/post-detail'
import { isPubliclyIndexableEntity } from '@/lib/seo'

export const alt = 'Askold Astakhov article'
export const contentType = ogContentType
export const size = ogSize

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: 'en' | 'ru'; slug: string }> }) {
  const { locale, slug } = await params
  const [{ post }, t] = await Promise.all([
    getPostDetailBySlug(slug, locale),
    getTranslations({ locale, namespace: 'posts' }),
  ])

  return createOgImage({
    description: post?.description || t('description'),
    kind: 'article',
    locale,
    title: post && isPubliclyIndexableEntity(post) ? post.title : t('title'),
  })
}

import { getTranslations } from 'next-intl/server'

import { createOgImage, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Askold Astakhov projects'
export const contentType = ogContentType
export const size = ogSize

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })

  return createOgImage({
    description: t('description'),
    kind: 'project',
    locale,
    title: t('title'),
  })
}

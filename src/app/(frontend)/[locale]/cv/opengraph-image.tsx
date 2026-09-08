import { getTranslations } from 'next-intl/server'

import { getCV } from '@/lib/cv'
import { createOgImage, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Askold Astakhov CV'
export const contentType = ogContentType
export const size = ogSize

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  const [cv, t] = await Promise.all([
    getCV(locale),
    getTranslations({ locale, namespace: 'cv' }),
  ])

  return createOgImage({
    description: cv?.summary || t('defaultDescription'),
    kind: 'cv',
    locale,
    title: cv?.name || t('cvFallback'),
  })
}

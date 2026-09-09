import { createOgImage, ogContentType, ogSize } from '@/lib/og'
import { getSiteSettings } from '@/lib/siteSettings'

export const alt = 'Askold Astakhov writing'
export const contentType = ogContentType
export const size = ogSize

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return createOgImage({
    description: settings.blogPage.description,
    kind: 'writing',
    locale,
    title: settings.blogPage.title,
  })
}

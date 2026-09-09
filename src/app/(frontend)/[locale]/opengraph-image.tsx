import { createOgImage, ogContentType, ogSize } from '@/lib/og'
import { getSiteSettings } from '@/lib/siteSettings'

export const alt = 'Askold Astakhov'
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
    description: settings.homePage.heroDescription,
    kind: 'site',
    locale,
    title: settings.name,
  })
}

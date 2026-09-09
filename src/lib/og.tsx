import { ImageResponse } from 'next/og'

export const ogSize = {
  height: 630,
  width: 1200,
}

export const ogContentType = 'image/png'

export type OgKind = 'article' | 'cv' | 'project' | 'site' | 'topic' | 'writing'

type OgImageOptions = {
  description?: null | string
  kind: OgKind
  locale: 'en' | 'ru'
  title: string
}

const labels: Record<OgKind, Record<'en' | 'ru', string>> = {
  article: { en: 'Article', ru: 'Статья' },
  cv: { en: 'Curriculum vitae', ru: 'Резюме' },
  project: { en: 'Project', ru: 'Проект' },
  site: { en: 'Independent builder', ru: 'Независимый создатель' },
  topic: { en: 'Topic', ru: 'Тема' },
  writing: { en: 'Blog', ru: 'Блог' },
}

function truncate(value: null | string | undefined, limit: number): string | undefined {
  if (!value?.trim()) return undefined

  const normalized = value.replace(/\s+/g, ' ').trim()

  return normalized.length > limit ? `${normalized.slice(0, limit - 1).trimEnd()}…` : normalized
}

export function createOgImage({ description, kind, locale, title }: OgImageOptions) {
  const safeTitle = truncate(title, 110) || 'Askold Astakhov'
  const safeDescription = truncate(description, 170)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#111111',
          color: '#f8f7f2',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          height: '100%',
          padding: '64px 72px 56px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ background: '#f8f7f2', height: '8px', position: 'absolute', right: 0, top: 0, width: '100%' }} />
        <div style={{ display: 'flex', fontSize: '22px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {labels[kind][locale]}
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', maxWidth: '1010px' }}>
          <div style={{ display: 'flex', fontSize: safeTitle.length > 72 ? '64px' : '78px', fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 1.02 }}>
            {safeTitle}
          </div>
          {safeDescription ? (
            <div style={{ color: '#c9c7be', display: 'flex', fontSize: '28px', lineHeight: 1.3, marginTop: '28px', maxWidth: '900px' }}>
              {safeDescription}
            </div>
          ) : null}
        </div>
        <div style={{ alignItems: 'center', display: 'flex', fontSize: '22px', justifyContent: 'space-between' }}>
          <span>Askold Astakhov</span>
          <span style={{ color: '#c9c7be', textTransform: 'uppercase' }}>{locale}</span>
        </div>
      </div>
    ),
    ogSize,
  )
}

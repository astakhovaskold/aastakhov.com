import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Страница не найдена / Page not found',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootNotFound() {
  return (
    <html lang="ru">
      <head>
        <title>404 — Страница не найдена</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <main
          style={{
            padding: '4rem 2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <h1>404 — Страница не найдена / Page not found</h1>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Запрошенная страница не существует. / The requested page does not exist.
          </p>
          <p style={{ marginTop: '2rem' }}>
            <Link href="/ru">Перейти на главную (RU)</Link> · <Link href="/en">Go to homepage (EN)</Link>
          </p>
        </main>
      </body>
    </html>
  )
}

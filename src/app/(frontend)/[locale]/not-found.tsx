import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <section className="site-section">
      <div className="section-header">
        <h1 className="section-title">404 — {t('title')}</h1>
      </div>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        {t('description')}
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/" className="button">
          Home
        </Link>
      </div>
    </section>
  )
}

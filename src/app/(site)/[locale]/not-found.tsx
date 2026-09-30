import { getTranslations } from 'next-intl/server'
import { Glass } from '@/presentation/components/glass/Glass'
import { Link } from '@/presentation/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('errors')
  return (
    <main id="main" className="container-x grid min-h-dvh place-items-center py-16">
      <Glass variant="surface" className="max-w-xl p-8 text-center md:p-12">
        <h1 className="font-display text-3xl md:text-5xl">{t('notFoundTitle')}</h1>
        <p className="mt-4 text-[var(--ink-2)]">{t('notFoundText')}</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-6 text-white transition-transform duration-200 hover:-translate-y-px"
        >
          {t('backHome')}
        </Link>
      </Glass>
    </main>
  )
}

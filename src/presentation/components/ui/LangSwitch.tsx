'use client'
import { useLocale, useTranslations } from 'next-intl'
import { LOCALES } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { GlassIndicator } from '@/presentation/components/glass/GlassIndicator'
import { Link, usePathname } from '@/presentation/i18n/navigation'
import { cn } from '@/presentation/lib/cn'

const ACTIVE = 'text-[var(--ink)]'
const INACTIVE = 'text-[var(--ink-muted)] hover:text-[var(--accent-text)]'

export function LangSwitch() {
  const current = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')
  return (
    <Glass
      variant="pill"
      role="group"
      aria-label={t('language.switch')}
      data-testid="lang-switch"
      className="inline-flex gap-1 p-1"
    >
      <GlassIndicator activeKey={current} />
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={pathname}
          locale={code}
          hrefLang={code}
          data-indicator-key={code}
          lang={code}
          aria-current={code === current ? 'true' : undefined}
          aria-label={t(`language.${code}`)}
          className={cn(
            'relative grid min-h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-medium uppercase transition-colors duration-200',
            code === current ? ACTIVE : INACTIVE,
          )}
        >
          {code}
        </Link>
      ))}
    </Glass>
  )
}

'use client'
import { useTranslations } from 'next-intl'
import { Glass } from '@/presentation/components/glass/Glass'
import { Link } from '@/presentation/i18n/navigation'
import { cn } from '@/presentation/lib/cn'
import { Button } from './Button'
import { LangSwitch } from './LangSwitch'
import { NAV_ITEMS } from './nav-items'
import { SectionLink, useSectionHref } from './SectionLink'
import { useActiveSection } from './use-active-section'

const NAV_SECTION_IDS = NAV_ITEMS.map((item) => item.id)

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Nav({ name, jobTitle }: { name: string; jobTitle: string }) {
  const t = useTranslations('nav')
  const hrefFor = useSectionHref()
  const active = useActiveSection(NAV_SECTION_IDS)
  return (
    <Glass
      as="nav"
      variant="pill"
      refract
      aria-label={t('label')}
      data-testid="nav"
      className="fixed inset-x-3 top-3 z-50 flex items-center justify-between gap-2 py-2 pr-2 pl-3 md:inset-x-6 md:top-4"
    >
      <Link href="/" className="flex min-h-11 items-center gap-3 rounded-full" aria-label={name}>
        <span
          aria-hidden="true"
          className="font-display grid size-10 place-items-center rounded-full bg-[var(--glass-fill-strong)] text-sm font-semibold text-[var(--ink)] shadow-sm"
        >
          {initialsOf(name)}
        </span>
        <span className="flex flex-col leading-tight md:hidden lg:flex">
          <span className="font-display text-sm font-semibold text-[var(--ink)]">{name}</span>
          <span className="hidden text-xs text-[var(--ink-muted)] xl:block">{jobTitle}</span>
        </span>
      </Link>
      <ul className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map(({ id }) => (
          <li key={id}>
            <SectionLink
              href={hrefFor(id)}
              aria-current={active === id ? 'location' : undefined}
              className={cn(
                'flex min-h-11 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 lg:px-4',
                active === id
                  ? 'bg-white text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]',
              )}
            >
              {t(`items.${id}`)}
            </SectionLink>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <LangSwitch />
        <div className="hidden xl:block">
          <Button href={hrefFor('contact')} icon="arrow-up-right">
            {t('cta')}
          </Button>
        </div>
      </div>
    </Glass>
  )
}

'use client'
import { useTranslations } from 'next-intl'
import { Glass } from '@/presentation/components/glass/Glass'
import { cn } from '@/presentation/lib/cn'
import { UiIcon } from './Icon'
import { DOCK_ITEMS } from './nav-items'
import { SectionLink, useSectionHref } from './SectionLink'
import { useActiveSection } from './use-active-section'

const DOCK_SECTION_IDS = DOCK_ITEMS.map((item) => item.id)

export function Dock() {
  const t = useTranslations('nav')
  const hrefFor = useSectionHref()
  const active = useActiveSection(DOCK_SECTION_IDS)
  return (
    <Glass
      as="nav"
      variant="dock"
      aria-label={t('dockLabel')}
      data-testid="dock"
      className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-between gap-2 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {DOCK_ITEMS.map(({ id, icon }) => (
        <SectionLink
          key={id}
          href={hrefFor(id)}
          aria-current={active === id ? 'location' : undefined}
          className={cn(
            'flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 transition-colors duration-200',
            active === id ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--ink-muted)]',
          )}
        >
          <UiIcon name={icon} className="size-5" />
          <span className="text-[0.75rem] leading-none whitespace-nowrap">{t(`items.${id}`)}</span>
        </SectionLink>
      ))}
    </Glass>
  )
}

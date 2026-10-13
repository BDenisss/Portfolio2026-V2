'use client'
import { useTranslations } from 'next-intl'
import type { ProjectSummary } from '@/domain'
import { UiIcon } from '@/presentation/components/ui/Icon'
import { cn } from '@/presentation/lib/cn'

const arrowClasses =
  'glass grid size-11 cursor-pointer place-items-center rounded-full text-[var(--ink)] transition-[translate] hover:-translate-y-px'

type CarouselControlsProps = {
  projects: readonly ProjectSummary[]
  active: number
  reduced: boolean
  playing: boolean
  onGoTo: (index: number) => void
  onPrevious: () => void
  onNext: () => void
  onTogglePlaying: () => void
}

export function CarouselControls(props: CarouselControlsProps) {
  const { projects, active, reduced, playing, onGoTo, onPrevious, onNext, onTogglePlaying } = props
  const t = useTranslations('projects')
  return (
    <div className="mt-2 flex items-center justify-center gap-4">
      <button
        type="button"
        className={arrowClasses}
        data-stretch
        aria-label={t('previous')}
        onClick={onPrevious}
      >
        <UiIcon name="arrow-left" className="size-5" />
      </button>
      <div className="flex items-center gap-2">
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            aria-label={t('slideLabel', { current: index + 1, total: projects.length })}
            aria-current={index === active}
            onClick={() => onGoTo(index)}
            className="grid h-11 min-w-6 cursor-pointer place-items-center"
          >
            <span
              className={cn(
                'block h-2 rounded-full transition-all duration-300',
                index === active ? 'w-7 bg-[var(--accent-strong)]' : 'w-2 bg-[var(--ink-muted)]/50',
              )}
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        className={arrowClasses}
        data-stretch
        aria-label={t('next')}
        onClick={onNext}
      >
        <UiIcon name="arrow-right" className="size-5" />
      </button>
      {!reduced && (
        <button
          type="button"
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm text-[var(--ink-2)] underline-offset-4 hover:underline"
          onClick={onTogglePlaying}
        >
          <UiIcon name={playing ? 'pause' : 'play'} className="size-4" />
          {playing ? t('pause') : t('play')}
        </button>
      )}
    </div>
  )
}

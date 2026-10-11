'use client'
import { useTranslations } from 'next-intl'
import type { ProjectSummary } from '@/domain'
import { cn } from '@/presentation/lib/cn'
import { CarouselControls } from './CarouselControls'
import { ProjectCard } from './ProjectCard'
import { useCarousel } from './use-carousel'

const SPACER = 'shrink-0 basis-[calc((100%-var(--w))/2)]'

/** Carrousel de projets : la diapositive active est mise en avant, les autres reculent légèrement. */
export function ProjectsCarousel({ projects }: { projects: readonly ProjectSummary[] }) {
  const t = useTranslations('projects')
  const { trackRef, ...carousel } = useCarousel(projects.length)
  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={t('carouselLabel')}
      onMouseEnter={() => carousel.setEngaged(true)}
      onMouseLeave={() => carousel.setEngaged(false)}
      onFocus={() => carousel.setEngaged(true)}
      onBlur={() => carousel.setEngaged(false)}
      data-testid="projects-carousel"
    >
      <div
        ref={trackRef}
        tabIndex={0}
        aria-live={carousel.autoplay ? 'off' : 'polite'}
        className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto py-6 [--w:84%] md:-mx-6 md:[--w:56%] lg:-mx-8 lg:[--w:42%] [&::-webkit-scrollbar]:hidden"
      >
        <div aria-hidden="true" className={SPACER} />
        {projects.map((project, index) => (
          <div
            key={project.id}
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={t('slideLabel', { current: index + 1, total: projects.length })}
            className={cn(
              'shrink-0 basis-[var(--w)] snap-center px-2.5 transition-[transform,filter] duration-500 ease-[var(--ease-glass)]',
              index === carousel.active ? 'scale-100' : 'scale-[0.9] saturate-75',
            )}
          >
            <ProjectCard project={project} openLabel={t('open')} />
          </div>
        ))}
        <div aria-hidden="true" className={SPACER} />
      </div>
      <CarouselControls
        projects={projects}
        active={carousel.active}
        reduced={carousel.reduced}
        playing={carousel.playing}
        onGoTo={carousel.goTo}
        onPrevious={carousel.previous}
        onNext={carousel.next}
        onTogglePlaying={carousel.togglePlaying}
      />
    </div>
  )
}

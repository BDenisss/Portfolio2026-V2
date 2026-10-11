'use client'
import { useTranslations } from 'next-intl'
import type { KeyboardEvent } from 'react'
import type { ProjectSummary } from '@/domain'
import { slideOffset } from '@/presentation/lib/carousel'
import { cn } from '@/presentation/lib/cn'
import { CarouselControls } from './CarouselControls'
import { ProjectCard } from './ProjectCard'
import { useCarousel } from './use-carousel'
import { useSwipe } from './use-swipe'

const SIDE_SCALE = 0.84

type SlideProps = {
  project: ProjectSummary
  offset: number
  label: string
  openLabel: string
  onSelect: () => void
}

/** Une diapositive : l'active au centre ; les voisines reculent sur les côtés, inertes, et se centrent au clic. */
function Slide({ project, offset, label, openLabel, onSelect }: SlideProps) {
  const isActive = offset === 0
  return (
    <div
      data-slide
      data-active={isActive}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!isActive || undefined}
      onClick={isActive ? undefined : onSelect}
      className={cn(
        'w-[min(34rem,78vw)] justify-self-center transition-transform duration-700 ease-[var(--ease-glass)] [grid-area:stack] motion-reduce:transition-none',
        !isActive && 'cursor-pointer',
      )}
      style={{
        transform: `translateX(calc(${offset} * var(--shift))) scale(${isActive ? 1 : SIDE_SCALE})`,
        zIndex: isActive ? 2 : 1,
      }}
    >
      <div inert={!isActive} className={cn('h-full', !isActive && 'pointer-events-none')}>
        <ProjectCard project={project} openLabel={openLabel} />
      </div>
    </div>
  )
}

/** Carrousel de projets en boucle : la carte active au centre, ses voisines visibles de chaque côté. */
export function ProjectsCarousel({ projects }: { projects: readonly ProjectSummary[] }) {
  const t = useTranslations('projects')
  const { rootRef, ...carousel } = useCarousel(projects.length)
  const swipe = useSwipe(carousel.previous, carousel.next)
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') carousel.previous()
    if (event.key === 'ArrowRight') carousel.next()
  }
  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={t('carouselLabel')}
      onMouseEnter={() => carousel.setHovered(true)}
      onMouseLeave={() => carousel.setHovered(false)}
      onFocus={() => carousel.setFocused(true)}
      onBlur={() => carousel.setFocused(false)}
      onKeyDown={onKeyDown}
      data-testid="projects-carousel"
    >
      <div
        {...swipe}
        aria-live={carousel.rotating ? 'off' : 'polite'}
        className="grid touch-pan-y py-4 select-none [--shift:66%] [grid-template-areas:'stack'] md:[--shift:62%]"
      >
        {projects.map((project, index) => (
          <Slide
            key={project.id}
            project={project}
            offset={slideOffset(index, carousel.active, projects.length)}
            label={t('slideLabel', { current: index + 1, total: projects.length })}
            openLabel={t('open')}
            onSelect={() => carousel.goTo(index)}
          />
        ))}
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

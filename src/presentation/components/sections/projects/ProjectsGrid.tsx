'use client'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import type { ProjectSummary, Stack } from '@/domain'
import { Button } from '@/presentation/components/ui/Button'
import { featuredFirst, filterByStack, stacksUsedBy } from '@/presentation/lib/project-filter'
import { ProjectCard } from './ProjectCard'
import { ProjectFilter } from './ProjectFilter'

const INITIAL_VISIBLE = 6

type ProjectsGridProps = { projects: readonly ProjectSummary[]; stacks: readonly Stack[] }

export function ProjectsGrid({ projects, stacks }: ProjectsGridProps) {
  const t = useTranslations('projects')
  const [active, setActive] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const filters = useMemo(() => stacksUsedBy(projects, stacks), [projects, stacks])
  const matching = useMemo(() => featuredFirst(filterByStack(projects, active)), [projects, active])
  const shown = expanded ? matching : matching.slice(0, INITIAL_VISIBLE)

  return (
    <>
      <ProjectFilter
        stacks={filters}
        active={active}
        onChange={setActive}
        label={t('filterLabel')}
        allLabel={t('filterAll')}
      />
      {matching.length === 0 ? (
        <p role="status" className="text-[var(--ink-muted)]">
          {t('empty')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((project) => (
            <ProjectCard key={project.id} project={project} openLabel={t('open')} />
          ))}
        </div>
      )}
      {matching.length > INITIAL_VISIBLE && !expanded && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" aria-expanded={expanded} onClick={() => setExpanded(true)}>
            {t('more')}
          </Button>
        </div>
      )}
    </>
  )
}

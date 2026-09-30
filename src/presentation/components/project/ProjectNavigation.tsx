import { getTranslations } from 'next-intl/server'
import type { ProjectSummary } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Link } from '@/presentation/i18n/navigation'

function Neighbour({ project, label }: { project: ProjectSummary; label: string }) {
  return (
    <Glass
      as={Link}
      href={`/projects/${project.slug}`}
      interactive
      className="flex min-h-11 flex-col gap-1 p-5"
    >
      <span className="text-sm text-[var(--ink-muted)]">{label}</span>
      <span className="font-display text-lg text-[var(--ink)]">{project.title}</span>
    </Glass>
  )
}

export async function ProjectNavigation({
  previous,
  next,
}: {
  previous: ProjectSummary | null
  next: ProjectSummary | null
}) {
  if (!previous && !next) return null
  const t = await getTranslations('projects')
  return (
    <nav aria-label={t('title')} className="grid gap-4 md:grid-cols-2">
      {previous ? <Neighbour project={previous} label={t('previous')} /> : <span />}
      {next ? <Neighbour project={next} label={t('next')} /> : <span />}
    </nav>
  )
}

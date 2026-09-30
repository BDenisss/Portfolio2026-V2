import { getTranslations } from 'next-intl/server'
import type { Project } from '@/domain'
import { Button } from '@/presentation/components/ui/Button'
import { UiIcon } from '@/presentation/components/ui/Icon'
import { Link } from '@/presentation/i18n/navigation'

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-[var(--ink-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--ink)]">{value}</dd>
    </div>
  )
}

export async function ProjectHeader({ project }: { project: Project }) {
  const t = await getTranslations('projects')
  const { client, year, links } = project
  return (
    <header className="space-y-6">
      <Link
        href="/#projects"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--accent-text)]"
      >
        <UiIcon name="arrow-left" className="size-4" />
        {t('back')}
      </Link>
      <h1
        id="project-title"
        className="font-display text-[clamp(2.25rem,1rem+5vw,4rem)] leading-[1] font-semibold"
      >
        {project.title}
      </h1>
      {project.tagline && (
        <p className="max-w-prose text-xl text-[var(--ink-2)]">{project.tagline}</p>
      )}
      <dl className="flex flex-wrap gap-x-10 gap-y-3">
        {client && <Meta label={t('client')} value={client} />}
        {year && <Meta label={t('year')} value={String(year)} />}
      </dl>
      <div className="flex flex-wrap gap-3">
        {links.live && (
          <Button href={links.live} target="_blank" rel="noopener noreferrer" icon="arrow-up-right">
            {t('live')}
          </Button>
        )}
        {links.repo && (
          <Button
            variant="secondary"
            href={links.repo}
            target="_blank"
            rel="noopener noreferrer"
            icon="arrow-up-right"
          >
            {t('repo')}
          </Button>
        )}
      </div>
    </header>
  )
}

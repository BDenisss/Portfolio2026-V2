import type { ProjectSummary } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Chip } from '@/presentation/components/ui/Chip'
import { UiIcon } from '@/presentation/components/ui/Icon'
import { Link } from '@/presentation/i18n/navigation'
import { ProjectCover } from './ProjectCover'

const MAX_STACK_CHIPS = 4

type ProjectCardProps = { project: ProjectSummary; openLabel: string }

export function ProjectCard({ project, openLabel }: ProjectCardProps) {
  const visibleStacks = project.stacks.slice(0, MAX_STACK_CHIPS)
  const hiddenCount = project.stacks.length - visibleStacks.length
  return (
    <Glass
      as="article"
      interactive
      data-testid="project-card"
      className="group relative flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <ProjectCover project={project} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl">
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`${project.title} — ${openLabel}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </h3>
        {project.tagline && <p className="line-clamp-2 text-[var(--ink-2)]">{project.tagline}</p>}
        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {visibleStacks.map((stack) => (
            <li key={stack.id}>
              <Chip>{stack.name}</Chip>
            </li>
          ))}
          {hiddenCount > 0 && (
            <li>
              <Chip tone="accent">+{hiddenCount}</Chip>
            </li>
          )}
        </ul>
        <UiIcon
          name="arrow-up-right"
          className="absolute top-4 right-4 size-5 rounded-full bg-[var(--glass-fill-strong)] p-1 text-[var(--ink)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Glass>
  )
}

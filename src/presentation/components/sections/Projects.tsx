import type { ProjectSummary, Stack } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function Projects(_props: {
  projects: readonly ProjectSummary[]
  stacks: readonly Stack[]
}) {
  return (
    <Section id="projects" labelledBy="projects-title">
      <h2 id="projects-title" className="sr-only">
        Projects
      </h2>
    </Section>
  )
}

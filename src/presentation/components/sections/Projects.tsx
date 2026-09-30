import { useTranslations } from 'next-intl'
import type { ProjectSummary, Stack } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { ProjectsGrid } from './projects/ProjectsGrid'

export function Projects({
  projects,
  stacks,
}: {
  projects: readonly ProjectSummary[]
  stacks: readonly Stack[]
}) {
  const t = useTranslations('projects')
  return (
    <Section id="projects" labelledBy="projects-title">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} id="projects-title" />
      <ProjectsGrid projects={projects} stacks={stacks} />
    </Section>
  )
}

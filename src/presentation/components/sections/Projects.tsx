import { useTranslations } from 'next-intl'
import type { ProjectSummary } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { ProjectsCarousel } from './projects/ProjectsCarousel'

export function Projects({ projects }: { projects: readonly ProjectSummary[] }) {
  const t = useTranslations('projects')
  return (
    <Section id="projects" labelledBy="projects-title">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} id="projects-title" />
      <ProjectsCarousel projects={projects} />
    </Section>
  )
}

import type { Locale, Project, ProjectSummary } from '@/domain'
import type { PortfolioRepository } from '../ports/portfolio-repository'

export type ProjectPage = {
  readonly project: Project
  readonly previous: ProjectSummary | null
  readonly next: ProjectSummary | null
}

export class GetProjectPage {
  constructor(private readonly portfolio: PortfolioRepository) {}

  async execute(input: { locale: Locale; slug: string }): Promise<ProjectPage | null> {
    const project = await this.portfolio.getProjectBySlug(input.locale, input.slug)
    if (!project) return null
    const summaries = await this.portfolio.getProjectSummaries(input.locale)
    const index = summaries.findIndex((summary) => summary.slug === project.slug)
    if (index === -1) return { project, previous: null, next: null }
    return { project, previous: summaries[index - 1] ?? null, next: summaries[index + 1] ?? null }
  }
}

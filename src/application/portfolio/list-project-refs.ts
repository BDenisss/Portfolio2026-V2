import type { ProjectRef } from '@/domain'
import type { PortfolioRepository } from '../ports/portfolio-repository'

export class ListProjectRefs {
  constructor(private readonly portfolio: PortfolioRepository) {}

  execute(): Promise<ProjectRef[]> {
    return this.portfolio.getProjectRefs()
  }
}

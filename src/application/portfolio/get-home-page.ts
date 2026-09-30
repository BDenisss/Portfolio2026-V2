import { computeCareerStats, type Locale } from '@/domain'
import type { Clock } from '../ports/clock'
import type { PortfolioRepository } from '../ports/portfolio-repository'
import type { HomePage } from './home-page'

export class GetHomePage {
  constructor(
    private readonly portfolio: PortfolioRepository,
    private readonly clock: Clock,
  ) {}

  async execute(locale: Locale): Promise<HomePage> {
    const [site, cinematic, services, stacks, projects, experiences] = await Promise.all([
      this.portfolio.getSite(locale),
      this.portfolio.getCinematic(),
      this.portfolio.getServices(locale),
      this.portfolio.getStacks(locale),
      this.portfolio.getProjectSummaries(locale),
      this.portfolio.getExperiences(locale),
    ])
    const stats = computeCareerStats({
      experiences,
      projectsCount: projects.length,
      stacksCount: stacks.length,
      now: new Date(this.clock.now()),
    })
    return { site, cinematic, services, stacks, projects, experiences, stats }
  }
}

import type { Locale, SiteProfile } from '@/domain'
import type { PortfolioRepository } from '../ports/portfolio-repository'

export class GetSiteProfile {
  constructor(private readonly portfolio: PortfolioRepository) {}

  execute(locale: Locale): Promise<SiteProfile> {
    return this.portfolio.getSite(locale)
  }
}

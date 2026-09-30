import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { GetHomePage } from '@/application/portfolio/get-home-page'
import { GetProjectPage } from '@/application/portfolio/get-project-page'
import { GetSiteProfile } from '@/application/portfolio/get-site-profile'
import { ListProjectRefs } from '@/application/portfolio/list-project-refs'
import { PayloadPortfolioRepository } from '@/infrastructure/cms/payload/payload-portfolio-repository'
import { SystemClock } from '@/infrastructure/system/system-clock'

export type PortfolioUseCases = {
  readonly getSiteProfile: GetSiteProfile
  readonly getHomePage: GetHomePage
  readonly getProjectPage: GetProjectPage
  readonly listProjectRefs: ListProjectRefs
}

let instance: PortfolioUseCases | undefined

export function getPortfolioUseCases(): PortfolioUseCases {
  instance ??= buildPortfolioUseCases()
  return instance
}

function buildPortfolioUseCases(): PortfolioUseCases {
  const portfolio = new PayloadPortfolioRepository(() => getPayload({ config }))
  return {
    getSiteProfile: new GetSiteProfile(portfolio),
    getHomePage: new GetHomePage(portfolio, new SystemClock()),
    getProjectPage: new GetProjectPage(portfolio),
    listProjectRefs: new ListProjectRefs(portfolio),
  }
}

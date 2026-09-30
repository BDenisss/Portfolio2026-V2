import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPortfolioUseCases } from '@/composition'
import { isLocale } from '@/domain'
import { About } from '@/presentation/components/sections/About'
import { Contact } from '@/presentation/components/sections/Contact'
import { Hero } from '@/presentation/components/sections/Hero'
import { Journey } from '@/presentation/components/sections/Journey'
import { Process } from '@/presentation/components/sections/Process'
import { Projects } from '@/presentation/components/sections/Projects'
import { Services } from '@/presentation/components/sections/Services'
import { TechStack } from '@/presentation/components/sections/TechStack'
import { Interlude } from '@/presentation/components/cinematic/Interlude'
import { submitContact } from './_actions/submit-contact'

/** Filet de sécurité : la publication dans le CMS revalide déjà les pages (hooks Payload). */
export const revalidate = 3600

type LocaleParams = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const [site, t] = await Promise.all([
    getPortfolioUseCases().getSiteProfile.execute(locale),
    getTranslations({ locale, namespace: 'common' }),
  ])
  const { ogImage } = site.seo
  return {
    title: { absolute: site.seo.title || t('metaTitle') },
    description: site.seo.description || t('metaDescription'),
    openGraph: { images: ogImage ? [{ url: ogImage.url, alt: ogImage.alt }] : undefined },
  }
}

export default async function HomeRoute({ params }: LocaleParams) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const home = await getPortfolioUseCases().getHomePage.execute(locale)
  return (
    <>
      <Hero site={home.site} cinematic={home.cinematic} />
      <Interlude cinematic={home.cinematic} />
      <About site={home.site} stats={home.stats} />
      <Services services={home.services} />
      <TechStack stacks={home.stacks} />
      <Projects projects={home.projects} stacks={home.stacks} />
      <Journey experiences={home.experiences} />
      <Process headline={home.site.process.headline} steps={home.site.process.steps} />
      <Contact site={home.site} submitAction={submitContact} />
    </>
  )
}

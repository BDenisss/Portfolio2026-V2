import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getPortfolioUseCases } from '@/composition'
import { isLocale } from '@/domain'
import { Dock } from '@/presentation/components/ui/Dock'
import { Footer } from '@/presentation/components/ui/Footer'
import { Nav } from '@/presentation/components/ui/Nav'
import { RevealController } from '@/presentation/components/ui/RevealController'
import { SmoothScroll } from '@/presentation/components/ui/SmoothScroll'

export default async function ShellLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const site = await getPortfolioUseCases().getSiteProfile.execute(locale)
  return (
    <>
      <SmoothScroll />
      <RevealController />
      <Nav name={site.name} jobTitle={site.jobTitle} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer site={site} />
      <Dock />
    </>
  )
}

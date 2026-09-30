import type { Metadata } from 'next'
import { Outfit, Work_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { GlassFilters } from '@/presentation/components/glass/GlassFilters'
import { RefractionFlag } from '@/presentation/components/glass/RefractionFlag'
import { routing } from '@/presentation/i18n/routing'
import '@/presentation/styles/globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans', display: 'swap' })

const DEFAULT_SITE_URL = 'http://localhost:3000'

type LocaleParams = { params: Promise<{ locale: string }> }

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('metaTitle'), template: `%s — ${t('siteName')}` },
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}`, languages: { fr: '/fr', en: '/en' } },
    openGraph: { type: 'website', siteName: t('siteName'), locale },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const [messages, t] = await Promise.all([getMessages(), getTranslations('common')])
  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${workSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <RefractionFlag />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed top-4 left-4 z-[100] rounded-full bg-[var(--ink)] px-4 py-2 text-white"
        >
          {t('skipToContent')}
        </a>
        <GlassFilters />
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}

import { useLocale, useTranslations } from 'next-intl'
import { isLocale, type SiteProfile } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { UiIcon } from '@/presentation/components/ui/Icon'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { ContactForm, type ContactFormAction } from './contact/ContactForm'

type DetailRow = { label: string; value: string; href?: string }

function DetailItem({ row }: { row: DetailRow }) {
  return (
    <div>
      <dt className="text-sm text-[var(--ink-muted)]">{row.label}</dt>
      <dd className="font-medium text-[var(--ink)]">
        {row.href ? (
          <a
            href={row.href}
            {...(row.href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
            className="inline-flex min-h-11 items-center gap-1 text-[var(--accent-text)] underline-offset-4 hover:underline"
          >
            {row.value}
            <UiIcon name="arrow-up-right" className="size-4" />
          </a>
        ) : (
          row.value
        )}
      </dd>
    </div>
  )
}

const handleOf = (url: string): string => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

type Translate = ReturnType<typeof useTranslations<'contact'>>

/** Le téléphone n'apparaît que si l'éditeur l'a explicitement rendu public (`showPhone`). */
function detailRows(site: SiteProfile, t: Translate): DetailRow[] {
  const { email, linkedin, github, phone, showPhone } = site.contact
  return [
    ...(email ? [{ label: t('details.email'), value: email, href: `mailto:${email}` }] : []),
    ...(linkedin
      ? [{ label: t('details.linkedin'), value: handleOf(linkedin), href: linkedin }]
      : []),
    ...(github ? [{ label: t('details.github'), value: handleOf(github), href: github }] : []),
    ...(site.location ? [{ label: t('details.location'), value: site.location }] : []),
    ...(showPhone && phone
      ? [{ label: t('details.phone'), value: phone, href: `tel:${phone}` }]
      : []),
  ]
}

export function Contact({
  site,
  submitAction,
}: {
  site: SiteProfile
  submitAction: ContactFormAction
}) {
  const t = useTranslations('contact')
  const current = useLocale()
  const locale = isLocale(current) ? current : 'fr'
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            id="contact-title"
            className="mb-0 md:mb-0"
          />
          <p className="max-w-prose text-lg text-[var(--ink-2)]">{t('intro')}</p>
          <Glass variant="card" className="p-6">
            <h3 className="font-display mb-4 text-lg">{t('details.title')}</h3>
            <dl className="space-y-3">
              {detailRows(site, t).map((row) => (
                <DetailItem key={row.label} row={row} />
              ))}
            </dl>
          </Glass>
        </div>
        <Reveal className="lg:col-span-7">
          <Glass variant="surface" className="p-6 md:p-8">
            <ContactForm locale={locale} action={submitAction} />
          </Glass>
        </Reveal>
      </div>
    </Section>
  )
}

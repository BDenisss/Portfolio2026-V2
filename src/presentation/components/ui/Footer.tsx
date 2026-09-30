import { getTranslations } from 'next-intl/server'
import type { SiteProfile } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Button } from './Button'

type FooterLink = { label: string; href: string }

export async function Footer({ site }: { site: SiteProfile }) {
  const t = await getTranslations('footer')
  const links: FooterLink[] = [
    ...(site.contact.linkedin ? [{ label: t('linkedin'), href: site.contact.linkedin }] : []),
    ...(site.contact.github ? [{ label: t('github'), href: site.contact.github }] : []),
    ...(site.contact.email ? [{ label: t('email'), href: `mailto:${site.contact.email}` }] : []),
  ]
  return (
    <footer className="container-x pt-8 pb-28 md:pb-10">
      <Glass
        variant="surface"
        className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold text-[var(--ink)]">{site.name}</p>
          <p className="text-sm text-[var(--ink-muted)]">
            © {new Date().getFullYear()} {site.name}. {t('rights')}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">{t('builtWith')}</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent-text)] underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Button variant="secondary" href="#main" icon="arrow-up">
          {t('backToTop')}
        </Button>
      </Glass>
    </footer>
  )
}

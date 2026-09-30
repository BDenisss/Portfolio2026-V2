import { useTranslations } from 'next-intl'
import type { CareerStats, SiteProfile } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Button } from '@/presentation/components/ui/Button'
import type { UiIconName } from '@/presentation/components/ui/Icon'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { StatCard } from './about/StatCard'

const STAT_ICONS: readonly UiIconName[] = ['calendar', 'briefcase', 'code', 'sparkles']

type StatItem = { icon: UiIconName; value: string; label: string }
type Translate = ReturnType<typeof useTranslations<'about'>>

/** Statistiques calculées depuis le CMS (jamais figées), ou saisies à la main quand `autoStats` est décoché. */
function statItems(site: SiteProfile, stats: CareerStats, t: Translate): StatItem[] {
  if (!site.about.autoStats) {
    return site.about.stats.map((stat, index) => ({
      icon: STAT_ICONS[index % STAT_ICONS.length] ?? 'sparkles',
      value: stat.value,
      label: stat.label,
    }))
  }
  return [
    { icon: 'calendar', value: `${stats.years}+`, label: t('stats.years') },
    { icon: 'briefcase', value: String(stats.experiences), label: t('stats.experiences') },
    { icon: 'code', value: String(stats.technologies), label: t('stats.technologies') },
    { icon: 'sparkles', value: String(stats.projects), label: t('stats.projects') },
  ]
}

export function About({ site, stats }: { site: SiteProfile; stats: CareerStats }) {
  const t = useTranslations('about')
  return (
    <Section id="about" labelledBy="about-title">
      <Reveal>
        <Glass variant="surface" className="grid gap-10 p-6 md:p-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-8">
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={site.about.headline}
              id="about-title"
              className="mb-0 md:mb-0"
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statItems(site, stats, t).map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-6">
            <p className="max-w-prose text-lg text-[var(--ink-2)]">{site.about.bio}</p>
            <Button variant="secondary" href="#journey" icon="arrow-up-right">
              {t('cta')}
            </Button>
          </div>
        </Glass>
      </Reveal>
    </Section>
  )
}

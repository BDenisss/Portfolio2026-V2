import { getLocale, getTranslations } from 'next-intl/server'
import { isLocale, type Experience } from '@/domain'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { TimelineItem, type TimelineLabels } from './journey/TimelineItem'

export async function Journey({ experiences }: { experiences: readonly Experience[] }) {
  const [t, current] = await Promise.all([getTranslations('journey'), getLocale()])
  const locale = isLocale(current) ? current : 'fr'
  const labels: TimelineLabels = {
    present: t('present'),
    work: t('work'),
    education: t('education'),
    details: t('details'),
    stacks: t('stacks'),
  }
  return (
    <Section id="journey" labelledBy="journey-title">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} id="journey-title" />
      <ol className="space-y-0">
        {experiences.map((experience, index) => (
          <Reveal key={experience.id} as="div">
            <TimelineItem
              experience={experience}
              locale={locale}
              labels={labels}
              isLatest={index === 0}
            />
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}

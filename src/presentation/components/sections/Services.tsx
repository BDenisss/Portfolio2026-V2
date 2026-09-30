import { useTranslations } from 'next-intl'
import type { Service } from '@/domain'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { ServiceCard } from './services/ServiceCard'

export function Services({ services }: { services: readonly Service[] }) {
  const t = useTranslations('services')
  return (
    <Section id="services" labelledBy="services-title">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} id="services-title" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <Reveal key={service.id}>
            <ServiceCard service={service} cta={t('cta')} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

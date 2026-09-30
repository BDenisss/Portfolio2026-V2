import type { Service } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function Services(_props: { services: readonly Service[] }) {
  return (
    <Section id="services" labelledBy="services-title">
      <h2 id="services-title" className="sr-only">
        Services
      </h2>
    </Section>
  )
}

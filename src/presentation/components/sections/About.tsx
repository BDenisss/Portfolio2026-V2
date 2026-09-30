import type { CareerStats, SiteProfile } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function About(_props: { site: SiteProfile; stats: CareerStats }) {
  return (
    <Section id="about" labelledBy="about-title">
      <h2 id="about-title" className="sr-only">
        About
      </h2>
    </Section>
  )
}

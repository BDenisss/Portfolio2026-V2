import type { CinematicMedia, SiteProfile } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function Hero({ site }: { site: SiteProfile; cinematic: CinematicMedia }) {
  return (
    <Section id="hero" labelledBy="hero-title">
      <h1 id="hero-title">{site.name}</h1>
    </Section>
  )
}

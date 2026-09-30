import type { SiteProfile } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function Contact(_props: { site: SiteProfile; submitAction: unknown }) {
  return (
    <Section id="contact" labelledBy="contact-title">
      <h2 id="contact-title" className="sr-only">
        Contact
      </h2>
    </Section>
  )
}

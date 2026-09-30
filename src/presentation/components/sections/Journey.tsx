import type { Experience } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function Journey(_props: { experiences: readonly Experience[] }) {
  return (
    <Section id="journey" labelledBy="journey-title">
      <h2 id="journey-title" className="sr-only">
        Journey
      </h2>
    </Section>
  )
}

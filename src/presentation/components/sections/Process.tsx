import type { ProcessStep } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function Process(_props: { headline: string; steps: readonly ProcessStep[] }) {
  return (
    <Section id="process" labelledBy="process-title">
      <h2 id="process-title" className="sr-only">
        Process
      </h2>
    </Section>
  )
}

import type { Stack } from '@/domain'
import { Section } from '@/presentation/components/ui/Section'

export function TechStack(_props: { stacks: readonly Stack[] }) {
  return (
    <Section id="stack" labelledBy="stack-title">
      <h2 id="stack-title" className="sr-only">
        Stack
      </h2>
    </Section>
  )
}

import { useTranslations } from 'next-intl'
import type { ProcessStep as ProcessStepData } from '@/domain'
import { Reveal } from '@/presentation/components/ui/Reveal'
import { Section } from '@/presentation/components/ui/Section'
import { SectionHeading } from '@/presentation/components/ui/SectionHeading'
import { ProcessStep } from './process/ProcessStep'

export function Process({
  headline,
  steps,
}: {
  headline: string
  steps: readonly ProcessStepData[]
}) {
  const t = useTranslations('process')
  return (
    <Section id="process" labelledBy="process-title">
      <SectionHeading eyebrow={t('eyebrow')} title={headline} id="process-title" />
      <Reveal as="div">
        <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.title}
              index={index}
              step={step}
              showConnector={index < steps.length - 1}
            />
          ))}
        </ol>
      </Reveal>
    </Section>
  )
}

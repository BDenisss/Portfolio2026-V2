import type { ProcessStep as ProcessStepData } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { UiIcon } from '@/presentation/components/ui/Icon'

type ProcessStepProps = { index: number; step: ProcessStepData; showConnector: boolean }

const pad = (value: number): string => String(value).padStart(2, '0')

export function ProcessStep({ index, step, showConnector }: ProcessStepProps) {
  return (
    <li className="relative">
      <Glass
        variant="card"
        data-testid="process-step"
        className="flex h-full flex-col gap-3 p-6 transition-transform duration-200 hover:-translate-y-0.5"
      >
        <span className="font-display text-3xl font-semibold text-[var(--accent-text)]">
          {pad(index + 1)}
        </span>
        <h3 className="font-display text-xl">{step.title}</h3>
        <p className="text-[var(--ink-2)]">{step.text}</p>
      </Glass>
      {showConnector && (
        <UiIcon
          name="arrow-right"
          className="absolute top-1/2 -right-5 hidden size-4 -translate-y-1/2 text-[var(--ink-muted)] xl:block"
        />
      )}
    </li>
  )
}

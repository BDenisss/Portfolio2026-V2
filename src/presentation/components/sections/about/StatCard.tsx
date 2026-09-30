import { Glass } from '@/presentation/components/glass/Glass'
import { UiIcon, type UiIconName } from '@/presentation/components/ui/Icon'

type StatCardProps = { icon: UiIconName; value: string; label: string }

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Glass variant="card" data-testid="stat-card" className="flex flex-col gap-2 p-4">
      <UiIcon name={icon} className="size-5 text-[var(--accent-text)]" />
      <span className="font-display text-3xl leading-none font-semibold text-[var(--ink)]">
        {value}
      </span>
      <span className="text-sm text-[var(--ink-muted)]">{label}</span>
    </Glass>
  )
}

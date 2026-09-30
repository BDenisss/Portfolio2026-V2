import type { Stack } from '@/domain'
import { cn } from '@/presentation/lib/cn'

type ProjectFilterProps = {
  stacks: readonly Stack[]
  active: string | null
  onChange: (stackSlug: string | null) => void
  label: string
  allLabel: string
}

const BASE =
  'inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200'
const IDLE =
  'border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--ink-2)] hover:bg-white'
const PRESSED = 'border-transparent bg-[var(--ink)] text-white'

function FilterButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(BASE, pressed ? PRESSED : IDLE)}
    >
      {children}
    </button>
  )
}

export function ProjectFilter({ stacks, active, onChange, label, allLabel }: ProjectFilterProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-testid="project-filter"
      className="mb-8 flex flex-wrap gap-2"
    >
      <FilterButton pressed={active === null} onClick={() => onChange(null)}>
        {allLabel}
      </FilterButton>
      {stacks.map((stack) => (
        <FilterButton
          key={stack.slug}
          pressed={active === stack.slug}
          onClick={() => onChange(stack.slug)}
        >
          {stack.name}
        </FilterButton>
      ))}
    </div>
  )
}

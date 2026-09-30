import Image from 'next/image'
import type { Stack, StackIcon } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { iconColor } from '@/presentation/lib/stack-icon-color'

const ICON_PIXELS = 32

function StackIconView({ icon }: { icon: StackIcon }) {
  if (icon.kind === 'simple') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8">
        <path d={icon.path} style={{ fill: iconColor(icon.hex) }} />
      </svg>
    )
  }
  if (icon.kind === 'upload') {
    return <Image src={icon.url} alt="" width={ICON_PIXELS} height={ICON_PIXELS} />
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-8 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--ink)]"
    >
      {icon.letters}
    </span>
  )
}

export function StackTile({ stack }: { stack: Stack }) {
  return (
    <Glass
      variant="card"
      data-testid="stack-tile"
      className="flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center"
    >
      <StackIconView icon={stack.icon} />
      <span className="text-[0.8125rem] text-[var(--ink-2)]">{stack.name}</span>
    </Glass>
  )
}

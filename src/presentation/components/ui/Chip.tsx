import type { ReactNode } from 'react'
import { cn } from '@/presentation/lib/cn'

const TONES = {
  glass: 'bg-[var(--glass-fill)] text-[var(--ink-2)] border border-[var(--glass-border)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--ink)]',
} as const

type ChipProps = { tone?: keyof typeof TONES; className?: string; children: ReactNode }

export function Chip({ tone = 'glass', className, children }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-chip)] px-3 py-1 text-[0.8125rem] font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

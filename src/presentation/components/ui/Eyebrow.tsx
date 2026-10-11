import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/presentation/lib/cn'

export function Eyebrow({ children, className, ...rest }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      {...rest}
      className={cn(
        'text-[0.8125rem] font-medium tracking-[0.14em] text-[var(--accent-text)] uppercase',
        className,
      )}
    >
      {children}
    </p>
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/presentation/lib/cn'

type SectionProps = {
  id: string
  /** Convention : `<id>-title`, posé sur le titre de la section. */
  labelledBy?: string
  className?: string
  children: ReactNode
}

export function Section({ id, labelledBy, className, children }: SectionProps) {
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={labelledBy}
      className={cn('section-y scroll-mt-28', className)}
    >
      <div className="container-x">{children}</div>
    </section>
  )
}

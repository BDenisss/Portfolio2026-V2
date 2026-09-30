import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/presentation/lib/cn'

export type GlassVariant = 'surface' | 'card' | 'pill' | 'dock'

type GlassProps<T extends ElementType> = {
  as?: T
  variant?: GlassVariant
  interactive?: boolean
  refract?: boolean
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'variant'>

export function Glass<T extends ElementType = 'div'>({
  as,
  variant = 'card',
  interactive = false,
  refract = false,
  className,
  ...rest
}: GlassProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag
      data-glass={variant}
      data-refract={refract || undefined}
      data-interactive={interactive || undefined}
      className={cn('glass', `glass--${variant}`, className)}
      {...rest}
    />
  )
}

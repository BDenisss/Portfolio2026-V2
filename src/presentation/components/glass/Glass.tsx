import type { ComponentPropsWithoutRef, ComponentType, ElementType } from 'react'
import { cn } from '@/presentation/lib/cn'

export type GlassVariant = 'surface' | 'card' | 'pill' | 'dock'

type GlassOptions = { interactive?: boolean; refract?: boolean }

/** Attributs du matériau verre : point de vérité partagé par <Glass> et les éléments qui le portent directement. */
export function glassAttributes(
  variant: GlassVariant,
  { interactive = false, refract = false }: GlassOptions = {},
  className?: string,
) {
  return {
    'data-glass': variant,
    'data-refract': refract || undefined,
    'data-interactive': interactive || undefined,
    className: cn('glass', `glass--${variant}`, className),
  }
}

type GlassProps<T extends ElementType> = {
  as?: T
  variant?: GlassVariant
} & GlassOptions &
  Omit<ComponentPropsWithoutRef<T>, 'as' | 'variant'>

export function Glass<T extends ElementType = 'div'>({
  as,
  variant = 'card',
  interactive = false,
  refract = false,
  className,
  ...rest
}: GlassProps<T>) {
  const Tag = (as ?? 'div') as unknown as ComponentType<Record<string, unknown>>
  return <Tag {...glassAttributes(variant, { interactive, refract }, className)} {...rest} />
}

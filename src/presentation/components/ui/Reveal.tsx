import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/presentation/lib/cn'

type RevealProps<T extends ElementType> = {
  as?: T
  className?: string
  /** Indicatif : l'échelonnement réel est géré par le batch de <RevealController/>. */
  delay?: number
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/** Marque un bloc comme « à révéler au scroll ». Masqué seulement sous `html.js` (contenu visible sans JS). */
export function Reveal<T extends ElementType = 'div'>({
  as,
  className,
  delay,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : undefined
  return <Tag className={cn('reveal', className)} style={{ ...delayStyle, ...style }} {...rest} />
}

import type { ComponentPropsWithoutRef, ComponentType, ElementType } from 'react'
import { cn } from '@/presentation/lib/cn'

type RevealProps<T extends ElementType> = {
  as?: T
  className?: string
  /** Indicatif : l'échelonnement réel est géré par le batch de <RevealController/>. */
  delay?: number
  /** Direction d'entrée : du bas (par défaut) ou de la droite. */
  from?: 'below' | 'right'
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/** Marque un bloc comme « à révéler au scroll ». Masqué seulement sous `html.js` (contenu visible sans JS). */
export function Reveal<T extends ElementType = 'div'>({
  as,
  className,
  delay,
  from = 'below',
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? 'div') as unknown as ComponentType<Record<string, unknown>>
  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : undefined
  return (
    <Tag
      className={cn('reveal', className)}
      data-reveal={from}
      style={{ ...delayStyle, ...style }}
      {...rest}
    />
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/presentation/lib/cn'

export type ControlProps = {
  id: string
  'aria-invalid': boolean | undefined
  'aria-describedby': string | undefined
  className: string
}

type FormFieldProps = {
  id: string
  label: string
  /** Message d'erreur déjà traduit ; absent quand le champ est valide. */
  error: string | undefined
  children: (control: ControlProps) => ReactNode
}

// 16px (`text-base`) : en dessous, iOS zoome sur le champ au focus.
// `scroll-mt-28` : le focus programmatique ne doit pas laisser le champ sous la nav fixe.
const CONTROL =
  'min-h-11 w-full scroll-mt-28 rounded-2xl border bg-white/80 px-4 py-2.5 text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)]'
// ≥ 3:1 sur le verre (WCAG 1.4.11) : le contour d'un champ doit être perceptible.
const BORDER_IDLE = 'border-[color-mix(in_srgb,var(--ink-muted)_75%,white)]'
const BORDER_INVALID = 'border-[var(--danger)]'

/** Label visible au-dessus, contrôle, puis l'erreur sous le champ, reliée par aria-describedby. */
export function FormField({ id, label, error, children }: FormFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
        className: cn(CONTROL, error ? BORDER_INVALID : BORDER_IDLE),
      })}
      {error && (
        <p id={errorId} className="text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  )
}

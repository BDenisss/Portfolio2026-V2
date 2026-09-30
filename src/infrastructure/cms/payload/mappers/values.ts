/** Une relation Payload non peuplée est un id ; peuplée, c'est un objet. */
export const isPopulated = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const orNull = <T>(value: T | null | undefined): T | null => value || null

export const orEmpty = (value: string | null | undefined): string => value ?? ''

export const keepPresent = <T>(values: readonly (T | null)[]): T[] =>
  values.filter((value): value is T => value !== null)

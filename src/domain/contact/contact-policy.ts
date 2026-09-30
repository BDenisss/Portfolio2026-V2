/** Une soumission plus rapide qu'un humain ne peut remplir le formulaire est suspecte. */
export const MIN_FILL_MS = 3000
export const RATE_WINDOW_MS = 10 * 60 * 1000
export const RATE_MAX = 3

/** `startedAt` absent (JavaScript désactivé) : on n'applique pas le time-trap. */
export const isSubmittedTooFast = (startedAt: number | undefined, now: number): boolean =>
  startedAt !== undefined && now - startedAt < MIN_FILL_MS

export const isRateLimited = (recentCount: number): boolean => recentCount >= RATE_MAX

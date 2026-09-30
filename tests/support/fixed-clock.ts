import type { Clock } from '@/application/ports/clock'

export const fixedClock = (iso: string): Clock => ({ now: () => new Date(iso).getTime() })

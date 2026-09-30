import type { Locale } from '@/domain'

export function formatMonth(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

export function formatRange(
  start: string,
  end: string | null,
  locale: Locale,
  nowLabel: string,
): string {
  return `${formatMonth(start, locale)} — ${end ? formatMonth(end, locale) : nowLabel}`
}

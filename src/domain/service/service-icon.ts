export const SERVICE_ICON_NAMES = [
  'layers',
  'blocks',
  'bot',
  'cloud',
  'shield-check',
  'code',
  'database',
  'rocket',
  'cpu',
  'workflow',
  'globe',
  'smartphone',
] as const

export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number]

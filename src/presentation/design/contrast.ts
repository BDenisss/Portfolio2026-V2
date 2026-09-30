type Rgb = readonly [number, number, number]

const SHORT_HEX_LENGTH = 3
const BYTE_MAX = 255
const BYTE_MASK = 0xff
const GREEN_SHIFT = 8
const RED_SHIFT = 16
const SRGB_LINEAR_THRESHOLD = 0.03928
const SRGB_LINEAR_DIVISOR = 12.92
const SRGB_GAMMA_OFFSET = 0.055
const SRGB_GAMMA_SCALE = 1.055
const SRGB_GAMMA_EXPONENT = 2.4
const LUMINANCE_WEIGHTS = { red: 0.2126, green: 0.7152, blue: 0.0722 } as const
const CONTRAST_FLARE = 0.05

export function hexToRgb(hex: string): Rgb {
  const digits = hex.trim().replace('#', '')
  const full =
    digits.length === SHORT_HEX_LENGTH
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits
  const value = Number.parseInt(full, 16)
  return [(value >> RED_SHIFT) & BYTE_MASK, (value >> GREEN_SHIFT) & BYTE_MASK, value & BYTE_MASK]
}

function toLinearChannel(channel: number): number {
  const scaled = channel / BYTE_MAX
  if (scaled <= SRGB_LINEAR_THRESHOLD) return scaled / SRGB_LINEAR_DIVISOR
  return ((scaled + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE) ** SRGB_GAMMA_EXPONENT
}

export function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex)
  return (
    LUMINANCE_WEIGHTS.red * toLinearChannel(red) +
    LUMINANCE_WEIGHTS.green * toLinearChannel(green) +
    LUMINANCE_WEIGHTS.blue * toLinearChannel(blue)
  )
}

export function contrastRatio(first: string, second: string): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second))
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second))
  return (lighter + CONTRAST_FLARE) / (darker + CONTRAST_FLARE)
}

/** Couleur opaque (`#RRGGBB` majuscules) obtenue en posant `foreground` à `alpha` sur `background`. */
export function composite(foreground: string, alpha: number, background: string): string {
  const [frontRed, frontGreen, frontBlue] = hexToRgb(foreground)
  const [backRed, backGreen, backBlue] = hexToRgb(background)
  const blend = (front: number, back: number): number =>
    Math.round(front * alpha + back * (1 - alpha))
  const channels = [
    blend(frontRed, backRed),
    blend(frontGreen, backGreen),
    blend(frontBlue, backBlue),
  ]
  const hex = channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')
  return `#${hex.toUpperCase()}`
}

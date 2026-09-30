import * as simpleIcons from 'simple-icons'
import type { StackIcon } from '@/domain'

type SimpleIconData = { slug: string; title: string; hex: string; path: string }

const WORD_SEPARATORS = /[\s./-]+/
const MONOGRAM_FALLBACK = '?'
const MONOGRAM_LENGTH = 2

function isSimpleIconData(value: unknown): value is SimpleIconData {
  return typeof value === 'object' && value !== null && 'slug' in value && 'path' in value
}

const ICONS_BY_SLUG: ReadonlyMap<string, SimpleIconData> = new Map(
  Object.values(simpleIcons)
    .filter(isSimpleIconData)
    .map((icon) => [icon.slug, icon]),
)

export function hasSimpleIcon(slug: string): boolean {
  return ICONS_BY_SLUG.has(slug)
}

function monogramOf(name: string): string {
  const words = name.trim().split(WORD_SEPARATORS).filter(Boolean)
  const [firstWord = MONOGRAM_FALLBACK] = words
  const letters =
    words.length >= MONOGRAM_LENGTH
      ? words
          .slice(0, MONOGRAM_LENGTH)
          .map((word) => word.charAt(0))
          .join('')
      : firstWord.slice(0, MONOGRAM_LENGTH)
  return letters.toUpperCase()
}

type StackIconSource = {
  name: string
  simpleIconSlug?: string | null
  upload?: { url?: string | null; alt?: string | null } | null
}

export function resolveStackIcon(source: StackIconSource): StackIcon {
  if (source.upload?.url) {
    return { kind: 'upload', url: source.upload.url, alt: source.upload.alt ?? source.name }
  }
  const found = source.simpleIconSlug ? ICONS_BY_SLUG.get(source.simpleIconSlug) : undefined
  if (found) {
    return {
      kind: 'simple',
      slug: found.slug,
      title: found.title,
      hex: found.hex,
      path: found.path,
    }
  }
  return { kind: 'monogram', letters: monogramOf(source.name) }
}

import type { MediaAsset } from '@/domain'
import { isPopulated } from './values'

const numberOrNull = (value: unknown): number | null => (typeof value === 'number' ? value : null)
const stringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value ? value : null

/** Un champ `upload` est soit un id (non peuplé), soit le document média. */
export function mapMedia(media: unknown): MediaAsset | null {
  if (!isPopulated(media)) return null
  const url = stringOrNull(media.url)
  if (!url) return null
  return {
    url,
    alt: stringOrNull(media.alt) ?? '',
    width: numberOrNull(media.width),
    height: numberOrNull(media.height),
    mimeType: stringOrNull(media.mimeType),
  }
}

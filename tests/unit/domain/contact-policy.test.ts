import { describe, expect, it } from 'vitest'
import { isRateLimited, isSubmittedTooFast, MIN_FILL_MS, RATE_MAX } from '@/domain'

const now = 1_800_000_000_000

describe('isSubmittedTooFast', () => {
  it('refuse une soumission plus rapide que le temps minimal', () => {
    expect(isSubmittedTooFast(now - 1000, now)).toBe(true)
  })
  it('accepte une soumission un peu plus lente que le minimum', () => {
    expect(isSubmittedTooFast(now - MIN_FILL_MS - 1, now)).toBe(false)
  })
  it('n’applique rien sans horodatage (JavaScript désactivé)', () => {
    expect(isSubmittedTooFast(undefined, now)).toBe(false)
  })
})

describe('isRateLimited', () => {
  it('autorise sous la limite', () => {
    expect(isRateLimited(RATE_MAX - 1)).toBe(false)
  })
  it('bloque à la limite', () => {
    expect(isRateLimited(RATE_MAX)).toBe(true)
  })
})

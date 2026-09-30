import { describe, expect, it } from 'vitest'
import { cn } from '@/presentation/lib/cn'

describe('cn', () => {
  it('joint les classes et ignore les valeurs falsy', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })
})

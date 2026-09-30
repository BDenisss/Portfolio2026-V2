import { describe, expect, it } from 'vitest'
import { anyone, isAdmin, publishedOrAdmin } from '@/infrastructure/cms/payload/access'

const asUser = { req: { user: { id: 1 } } } as never
const asGuest = { req: { user: null } } as never

describe('access', () => {
  it('anyone autorise tout le monde', () => {
    expect(anyone(asGuest)).toBe(true)
  })
  it('isAdmin exige un utilisateur connecté', () => {
    expect(isAdmin(asUser)).toBe(true)
    expect(isAdmin(asGuest)).toBe(false)
  })
  it('publishedOrAdmin : admin voit tout, visiteur uniquement les publiés', () => {
    expect(publishedOrAdmin(asUser)).toBe(true)
    expect(publishedOrAdmin(asGuest)).toEqual({ _status: { equals: 'published' } })
  })
})

import { describe, expect, it, vi } from 'vitest'
import {
  createRevalidateDeleteHook,
  createRevalidateGlobalHook,
  createRevalidateHook,
} from '@/infrastructure/cms/payload/hooks/revalidate'

describe('createRevalidateHook', () => {
  it('revalide les chemins du document', () => {
    const revalidate = vi.fn()
    const doc = { slug: 'ma-app' }
    const out = createRevalidateHook(
      'project',
      revalidate,
    )({
      doc,
      previousDoc: {},
      req: { context: {} },
    } as never)
    expect(out).toBe(doc)
    expect(revalidate.mock.calls.map((call) => call[0])).toEqual([
      '/fr',
      '/en',
      '/fr/projects/ma-app',
      '/en/projects/ma-app',
    ])
  })
  it("revalide aussi l'ancien slug", () => {
    const revalidate = vi.fn()
    createRevalidateHook(
      'project',
      revalidate,
    )({
      doc: { slug: 'nouveau' },
      previousDoc: { slug: 'ancien' },
      req: { context: {} },
    } as never)
    expect(revalidate.mock.calls.map((call) => call[0])).toEqual([
      '/fr',
      '/en',
      '/fr/projects/nouveau',
      '/en/projects/nouveau',
      '/fr/projects/ancien',
      '/en/projects/ancien',
    ])
  })
  it('ne fait rien avec context.disableRevalidate', () => {
    const revalidate = vi.fn()
    createRevalidateHook(
      'home',
      revalidate,
    )({
      doc: {},
      previousDoc: {},
      req: { context: { disableRevalidate: true } },
    } as never)
    expect(revalidate).not.toHaveBeenCalled()
  })
  it('avale les erreurs hors contexte de requête (seed, scripts)', () => {
    const revalidate = vi.fn(() => {
      throw new Error('Invariant: static generation store missing')
    })
    expect(() =>
      createRevalidateHook(
        'home',
        revalidate,
      )({
        doc: {},
        previousDoc: {},
        req: { context: {} },
      } as never),
    ).not.toThrow()
  })
})

describe('hooks delete / global', () => {
  it('delete revalide le slug supprimé', () => {
    const revalidate = vi.fn()
    createRevalidateDeleteHook(
      'project',
      revalidate,
    )({
      doc: { slug: 'x' },
      req: { context: {} },
    } as never)
    expect(revalidate).toHaveBeenCalledWith('/fr/projects/x')
  })
  it('global revalide la home', () => {
    const revalidate = vi.fn()
    createRevalidateGlobalHook(revalidate)({ doc: {}, req: { context: {} } } as never)
    expect(revalidate.mock.calls.map((call) => call[0])).toEqual(['/fr', '/en'])
  })
})

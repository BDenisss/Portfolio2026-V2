import { describe, expect, it, vi } from 'vitest'
import { detectCapabilities } from '@/presentation/cinematic/capabilities'

type FakeOptions = {
  matches?: readonly string[]
  navigator?: Record<string, unknown>
  context?: unknown
  contextThrows?: boolean
}

const fakeWindow = ({
  matches = [],
  navigator = {},
  context = {},
  contextThrows = false,
}: FakeOptions = {}) =>
  ({
    matchMedia: (query: string) => ({ matches: matches.includes(query) }),
    navigator,
    document: {
      createElement: () => ({
        getContext: () => {
          if (contextThrows) throw new Error('WebGL bloqué')
          return context
        },
      }),
    },
  }) as unknown as Window

describe('detectCapabilities', () => {
  it('lit prefers-reduced-motion et le mode mobile depuis matchMedia', () => {
    const capabilities = detectCapabilities(
      fakeWindow({ matches: ['(prefers-reduced-motion: reduce)', '(max-width: 767px)'] }),
    )
    expect(capabilities).toMatchObject({ reducedMotion: true, mobile: true })
  })
  it('ne marque ni reduced-motion ni mobile sans correspondance', () => {
    expect(detectCapabilities(fakeWindow())).toMatchObject({ reducedMotion: false, mobile: false })
  })
  it('lit saveData, deviceMemory et hardwareConcurrency du navigateur', () => {
    const capabilities = detectCapabilities(
      fakeWindow({
        navigator: { hardwareConcurrency: 8, deviceMemory: 4, connection: { saveData: true } },
      }),
    )
    expect(capabilities).toMatchObject({ saveData: true, deviceMemory: 4, hardwareConcurrency: 8 })
  })
  it('saveData vaut false quand l’API de connexion est absente', () => {
    expect(detectCapabilities(fakeWindow()).saveData).toBe(false)
  })
  it('détecte WebGL quand un contexte est disponible', () => {
    expect(detectCapabilities(fakeWindow({ context: {} })).webgl).toBe(true)
  })
  it('considère WebGL indisponible sans contexte', () => {
    expect(detectCapabilities(fakeWindow({ context: null })).webgl).toBe(false)
  })
  it('considère WebGL indisponible quand la sonde lève une erreur', () => {
    expect(detectCapabilities(fakeWindow({ contextThrows: true })).webgl).toBe(false)
  })
  it('ne crée aucun canvas quand la sonde WebGL n’est pas demandée (aucun modèle 3D à afficher)', () => {
    const win = fakeWindow({ context: {} })
    const createElement = vi.spyOn(win.document, 'createElement')

    const capabilities = detectCapabilities(win, { probeWebgl: false })

    expect(capabilities.webgl).toBe(false)
    expect(createElement).not.toHaveBeenCalled()
  })
})

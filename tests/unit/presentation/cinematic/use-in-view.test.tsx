// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInView } from '@/presentation/cinematic/use-hero-runtime'

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void

let deliver: Callback = () => undefined

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: Callback) {
        deliver = callback
      }
      observe() {}
      disconnect() {}
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

const mountedRef = () => ({ current: document.createElement('div') })

describe('useInView', () => {
  it('démarre visible, avant toute mesure', () => {
    const { result } = renderHook(() => useInView(mountedRef()))
    expect(result.current).toBe(true)
  })

  it('suit l’état d’intersection rapporté', () => {
    const { result } = renderHook(() => useInView(mountedRef()))
    act(() => deliver([{ isIntersecting: false }]))
    expect(result.current).toBe(false)
  })

  it('retient la dernière entrée d’un lot : une entrée périmée ne doit pas l’emporter', () => {
    // GSAP déplace la section dans son pin-spacer : l'observateur reçoit « hors écran » puis « à l'écran » dans le même lot.
    const { result } = renderHook(() => useInView(mountedRef()))
    act(() => deliver([{ isIntersecting: false }, { isIntersecting: true }]))
    expect(result.current).toBe(true)
  })
})

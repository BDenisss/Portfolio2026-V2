'use client'
import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'
import { detectCapabilities, type Capabilities } from './capabilities'

const FIXTURE_MODEL_URL = '/fixtures/avatar-fixture.glb'
const IDLE_FALLBACK_MS = 1

const noopSubscribe = (): (() => void) => () => undefined

// Lu une seule fois : la sonde WebGL crée un contexte, elle ne doit pas se rejouer à chaque rendu.
let cachedCapabilities: Capabilities | null = null
function readCapabilities(): Capabilities {
  cachedCapabilities ??= detectCapabilities()
  return cachedCapabilities
}

/** `null` au rendu serveur et à l'hydratation : le premier rendu est donc celui du poster (CLS nul). */
export function useCapabilities(): Capabilities | null {
  return useSyncExternalStore(noopSubscribe, readCapabilities, () => null)
}

function readFixtureModelUrl(): string | null {
  if (process.env.NEXT_PUBLIC_E2E !== '1') return null
  const requested = new URLSearchParams(window.location.search).get('__fixture') === 'avatar'
  return requested ? FIXTURE_MODEL_URL : null
}

/** Avatar de fixture pour les tests E2E (`?__fixture=avatar`) ; jamais actif en production. */
export function useFixtureModelUrl(): string | null {
  return useSyncExternalStore(noopSubscribe, readFixtureModelUrl, () => null)
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true,
  )
}

export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) =>
      setInView(Boolean(entry?.isIntersecting)),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

/** Devient vrai quand le navigateur est au repos : le Canvas 3D ne doit pas concurrencer le premier rendu. */
export function useIdleFlag(enabled: boolean): boolean {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if (!enabled) return
    const markIdle = (): void => setIdle(true)
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(markIdle)
      return () => window.cancelIdleCallback(handle)
    }
    const handle = setTimeout(markIdle, IDLE_FALLBACK_MS)
    return () => clearTimeout(handle)
  }, [enabled])
  return idle
}

/** Devient vrai `delayMs` après que `armed` est passé à vrai. */
export function useTimeoutFlag(armed: boolean, delayMs: number): boolean {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const handle = window.setTimeout(() => setElapsed(true), delayMs)
    return () => window.clearTimeout(handle)
  }, [armed, delayMs])
  return elapsed
}

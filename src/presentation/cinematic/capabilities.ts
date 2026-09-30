import type { Capabilities } from './hero-mode'

export type { Capabilities } from './hero-mode'

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

const MOBILE_QUERY = '(max-width: 767px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function supportsWebgl(win: Window): boolean {
  try {
    const canvas = win.document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    // Certains navigateurs durcis lèvent une exception à la création du contexte : on le traite comme « pas de WebGL ».
    return false
  }
}

/** À appeler côté client uniquement (lit matchMedia, navigator et sonde WebGL). */
export function detectCapabilities(win: Window = window): Capabilities {
  const hints = win.navigator as NavigatorWithHints
  return {
    reducedMotion: win.matchMedia(REDUCED_MOTION_QUERY).matches,
    saveData: Boolean(hints.connection?.saveData),
    deviceMemory: hints.deviceMemory,
    hardwareConcurrency: hints.hardwareConcurrency,
    webgl: supportsWebgl(win),
    mobile: win.matchMedia(MOBILE_QUERY).matches,
  }
}

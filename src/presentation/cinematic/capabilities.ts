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

export type DetectionOptions = {
  /** Faux quand aucun modèle 3D n'est à afficher : la sonde attend le GPU de façon synchrone pour un résultat inutile. */
  probeWebgl: boolean
}

/** À appeler côté client uniquement (lit matchMedia, navigator et, si demandé, sonde WebGL). */
export function detectCapabilities(
  win: Window = window,
  { probeWebgl }: DetectionOptions = { probeWebgl: true },
): Capabilities {
  const hints = win.navigator as NavigatorWithHints
  return {
    reducedMotion: win.matchMedia(REDUCED_MOTION_QUERY).matches,
    saveData: Boolean(hints.connection?.saveData),
    deviceMemory: hints.deviceMemory,
    hardwareConcurrency: hints.hardwareConcurrency,
    webgl: probeWebgl && supportsWebgl(win),
    mobile: win.matchMedia(MOBILE_QUERY).matches,
  }
}

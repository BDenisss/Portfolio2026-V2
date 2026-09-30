export type Capabilities = {
  reducedMotion: boolean
  saveData: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
  webgl: boolean
  mobile: boolean
}

export type HeroMedia = {
  hasModel: boolean
  hasVideo: boolean
  hasPortrait: boolean
  hasPoster: boolean
}

export type HeroMode = 'avatar3d' | 'video' | 'poster' | 'orb'

export type HeroDecision = { mode: HeroMode; animate: boolean }

// Seuils « appareil modeste » : en dessous, on évite le GLB (mémoire GPU) au profit de la vidéo.
const LOW_MEMORY_GB = 4
const LOW_CORE_COUNT = 4

const isAtMost = (value: number | undefined, limit: number): boolean =>
  value !== undefined && value <= limit

export function isLowPower(capabilities: Capabilities): boolean {
  return (
    capabilities.saveData ||
    isAtMost(capabilities.deviceMemory, LOW_MEMORY_GB) ||
    isAtMost(capabilities.hardwareConcurrency, LOW_CORE_COUNT)
  )
}

/** Choisit le rendu le plus riche que l'appareil et les médias disponibles permettent, avec repli garanti. */
export function decideHeroMode(capabilities: Capabilities, media: HeroMedia): HeroDecision {
  const hasStill = media.hasPoster || media.hasPortrait
  if (capabilities.reducedMotion) return { mode: hasStill ? 'poster' : 'orb', animate: false }
  if (media.hasModel && capabilities.webgl && !isLowPower(capabilities)) {
    return { mode: 'avatar3d', animate: true }
  }
  if (media.hasVideo && !capabilities.saveData) return { mode: 'video', animate: true }
  if (hasStill) return { mode: 'poster', animate: !capabilities.saveData }
  return { mode: 'orb', animate: true }
}

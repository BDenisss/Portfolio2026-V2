'use client'
import { useCallback, useState, type RefObject } from 'react'
import type { CinematicMedia, MediaAsset, VideoPair } from '@/domain'
import type { Capabilities } from './capabilities'
import { describeHeroMedia, pickVideoSources } from './hero-media'
import { decideHeroMode, type HeroDecision, type HeroMedia, type HeroMode } from './hero-mode'
import {
  useCapabilities,
  useFixtureModelUrl,
  useIdleFlag,
  useInView,
  usePageVisible,
  useTimeoutFlag,
} from './use-hero-runtime'

// Au-delà, on reste sur la couche de base (poster/orbe) : un modèle qui ne charge pas ne doit jamais bloquer le hero.
const AVATAR_TIMEOUT_MS = 8000

export type HeroStageState = {
  mode: HeroMode
  ready: boolean
  active: boolean
  mobile: boolean
  base: MediaAsset | null
  video: VideoPair | null
  loopVideo: boolean
  showVideo: boolean
  model: string | null
  mountCanvas: boolean
  showCanvas: boolean
  onCanvasReady: () => void
  onIntroEnded: () => void
}

/** Avant la détection des capacités (rendu serveur, hydratation) : le poster, sans animation. */
const initialDecision = (media: HeroMedia): HeroDecision => ({
  mode: media.hasPoster || media.hasPortrait ? 'poster' : 'orb',
  animate: false,
})

/** La fixture E2E force le chemin 3D quelle que soit la puissance du runner de CI ; reduced-motion reste respecté. */
const ignoringPowerLimits = (capabilities: Capabilities): Capabilities => ({
  ...capabilities,
  saveData: false,
  deviceMemory: undefined,
  hardwareConcurrency: undefined,
})

function useHeroDecision(cinematic: CinematicMedia) {
  const fixtureModel = useFixtureModelUrl()
  const media = describeHeroMedia(cinematic, fixtureModel)
  const detected = useCapabilities(media.hasModel)
  const capabilities = detected && fixtureModel ? ignoringPowerLimits(detected) : detected
  return {
    decision: capabilities ? decideHeroMode(capabilities, media) : initialDecision(media),
    mobile: capabilities?.mobile ?? false,
    model: fixtureModel ?? cinematic.avatarModel?.url ?? null,
  }
}

type LifecycleInput = { mode: HeroMode; model: string | null; hasIntro: boolean }

/** Cycle de vie du Canvas 3D : monté au repos, affiché quand il est prêt et que la vidéo d'intro est finie. */
function useAvatarLifecycle({ mode, model, hasIntro }: LifecycleInput) {
  const [canvasReady, setCanvasReady] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const onCanvasReady = useCallback(() => setCanvasReady(true), [])
  const onIntroEnded = useCallback(() => setIntroDone(true), [])

  const wantsCanvas = mode === 'avatar3d' && model !== null
  const idle = useIdleFlag(wantsCanvas)
  const gaveUp = useTimeoutFlag(wantsCanvas && !canvasReady, AVATAR_TIMEOUT_MS)
  const mountCanvas = wantsCanvas && idle && !gaveUp
  const showCanvas = mountCanvas && canvasReady && (!hasIntro || introDone)
  return { canvasReady, gaveUp, mountCanvas, showCanvas, onCanvasReady, onIntroEnded }
}

function useIsActive(frame: RefObject<Element | null>, animate: boolean): boolean {
  const inView = useInView(frame)
  const pageVisible = usePageVisible()
  return inView && pageVisible && animate
}

export function useHeroStage(
  cinematic: CinematicMedia,
  frame: RefObject<Element | null>,
): HeroStageState {
  const { decision, mobile, model } = useHeroDecision(cinematic)
  const { mode } = decision
  const video = mode === 'video' || mode === 'avatar3d' ? pickVideoSources(cinematic, mobile) : null
  const lifecycle = useAvatarLifecycle({
    mode,
    model,
    hasIntro: mode === 'avatar3d' && video !== null,
  })
  const active = useIsActive(frame, decision.animate)
  return {
    mode,
    ready: mode !== 'avatar3d' || (lifecycle.canvasReady && !lifecycle.gaveUp),
    active,
    mobile,
    base: cinematic.heroPoster ?? cinematic.avatarPortrait,
    video,
    loopVideo: mode === 'video',
    showVideo: video !== null && !lifecycle.showCanvas,
    model,
    mountCanvas: lifecycle.mountCanvas,
    showCanvas: lifecycle.showCanvas,
    onCanvasReady: lifecycle.onCanvasReady,
    onIntroEnded: lifecycle.onIntroEnded,
  }
}

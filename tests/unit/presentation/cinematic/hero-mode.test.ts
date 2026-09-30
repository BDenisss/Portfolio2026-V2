import { describe, expect, it } from 'vitest'
import {
  decideHeroMode,
  isLowPower,
  type Capabilities,
  type HeroMedia,
} from '@/presentation/cinematic/hero-mode'

const base: Capabilities = {
  reducedMotion: false,
  saveData: false,
  webgl: true,
  mobile: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
}
const all: HeroMedia = { hasModel: true, hasVideo: true, hasPortrait: true, hasPoster: true }
const none: HeroMedia = { hasModel: false, hasVideo: false, hasPortrait: false, hasPoster: false }

describe('isLowPower', () => {
  it('saveData, ≤ 4 Go ou ≤ 4 cœurs', () => {
    expect(isLowPower({ ...base, saveData: true })).toBe(true)
    expect(isLowPower({ ...base, deviceMemory: 4 })).toBe(true)
    expect(isLowPower({ ...base, hardwareConcurrency: 4 })).toBe(true)
    expect(isLowPower(base)).toBe(false)
  })
  it('valeurs inconnues → pas de basse conso', () => {
    expect(isLowPower({ ...base, deviceMemory: undefined, hardwareConcurrency: undefined })).toBe(
      false,
    )
  })
})

describe('decideHeroMode', () => {
  it('tout dispo + machine correcte → avatar3d animé', () => {
    expect(decideHeroMode(base, all)).toEqual({ mode: 'avatar3d', animate: true })
  })
  it('reduced-motion → poster statique', () => {
    expect(decideHeroMode({ ...base, reducedMotion: true }, all)).toEqual({
      mode: 'poster',
      animate: false,
    })
  })
  it('reduced-motion sans image → orbe statique', () => {
    expect(decideHeroMode({ ...base, reducedMotion: true }, none)).toEqual({
      mode: 'orb',
      animate: false,
    })
  })
  it('pas de WebGL → vidéo', () => {
    expect(decideHeroMode({ ...base, webgl: false }, all)).toEqual({ mode: 'video', animate: true })
  })
  it('appareil faible → vidéo (pas de GLB)', () => {
    expect(decideHeroMode({ ...base, deviceMemory: 2 }, all).mode).toBe('video')
  })
  it('saveData → poster (ni GLB ni vidéo)', () => {
    expect(decideHeroMode({ ...base, saveData: true }, all).mode).toBe('poster')
  })
  it('saveData → poster figé', () => {
    expect(decideHeroMode({ ...base, saveData: true }, all).animate).toBe(false)
  })
  it('modèle seul, pas de vidéo → avatar3d', () => {
    expect(decideHeroMode(base, { ...none, hasModel: true }).mode).toBe('avatar3d')
  })
  it('aucun média → orbe', () => {
    expect(decideHeroMode(base, none)).toEqual({ mode: 'orb', animate: true })
  })
})

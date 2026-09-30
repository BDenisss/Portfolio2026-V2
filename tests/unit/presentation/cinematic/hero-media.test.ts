import { describe, expect, it } from 'vitest'
import { describeHeroMedia, pickVideoSources } from '@/presentation/cinematic/hero-media'
import { aCinematicMedia } from '../../../support/builders'

const asset = (url: string) => ({ url, alt: '', width: null, height: null, mimeType: null })

describe('describeHeroMedia', () => {
  it('ne signale aucun média pour un CMS vide', () => {
    expect(describeHeroMedia(aCinematicMedia(), null)).toEqual({
      hasModel: false,
      hasVideo: false,
      hasPortrait: false,
      hasPoster: false,
    })
  })
  it('signale chaque média renseigné', () => {
    const cinematic = aCinematicMedia({
      avatarModel: asset('/a.glb'),
      avatarPortrait: asset('/p.png'),
      heroPoster: asset('/h.webp'),
      heroVideoDesktop: { mp4: asset('/v.mp4'), webm: null },
    })
    expect(describeHeroMedia(cinematic, null)).toEqual({
      hasModel: true,
      hasVideo: true,
      hasPortrait: true,
      hasPoster: true,
    })
  })
  it('une URL de modèle imposée (fixture E2E) compte comme un modèle', () => {
    expect(describeHeroMedia(aCinematicMedia(), '/fixtures/avatar-fixture.glb').hasModel).toBe(true)
  })
})

describe('pickVideoSources', () => {
  const desktop = { mp4: asset('/d.mp4'), webm: null }
  const mobile = { mp4: asset('/m.mp4'), webm: null }
  const cinematic = aCinematicMedia({ heroVideoDesktop: desktop, heroVideoMobile: mobile })

  it('préfère la paire mobile sur mobile et la paire desktop sinon', () => {
    expect(pickVideoSources(cinematic, true)).toBe(mobile)
    expect(pickVideoSources(cinematic, false)).toBe(desktop)
  })
  it('se replie sur l’autre paire quand la préférée est vide', () => {
    expect(pickVideoSources(aCinematicMedia({ heroVideoDesktop: desktop }), true)).toBe(desktop)
  })
  it('renvoie null sans aucune vidéo', () => {
    expect(pickVideoSources(aCinematicMedia(), false)).toBeNull()
  })
})

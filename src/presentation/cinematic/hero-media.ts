import type { CinematicMedia, VideoPair } from '@/domain'
import type { HeroMedia } from './hero-mode'

const hasSource = (pair: VideoPair): boolean => Boolean(pair.mp4 ?? pair.webm)

/** `modelUrlOverride` : fixture de test E2E, qui tient lieu de modèle même quand le CMS n'en a pas. */
export function describeHeroMedia(
  cinematic: CinematicMedia,
  modelUrlOverride: string | null,
): HeroMedia {
  return {
    hasModel: Boolean(cinematic.avatarModel) || modelUrlOverride !== null,
    hasVideo: hasSource(cinematic.heroVideoDesktop) || hasSource(cinematic.heroVideoMobile),
    hasPortrait: Boolean(cinematic.avatarPortrait),
    hasPoster: Boolean(cinematic.heroPoster),
  }
}

/** La paire mobile (9:16) sur mobile, la paire desktop (16:9) sinon ; repli sur l'autre si la préférée est vide. */
export function pickVideoSources(cinematic: CinematicMedia, mobile: boolean): VideoPair | null {
  const preference = mobile
    ? [cinematic.heroVideoMobile, cinematic.heroVideoDesktop]
    : [cinematic.heroVideoDesktop, cinematic.heroVideoMobile]
  return preference.find(hasSource) ?? null
}

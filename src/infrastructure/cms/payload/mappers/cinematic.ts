import type { CinematicMedia, VideoPair } from '@/domain'
import type { Cinematic as CinematicDoc } from '../payload-types'
import { mapMedia } from './media'

function mapVideoPair(pair: CinematicDoc['heroVideoDesktop']): VideoPair {
  return { mp4: mapMedia(pair?.mp4), webm: mapMedia(pair?.webm) }
}

export function mapCinematic(doc: CinematicDoc): CinematicMedia {
  return {
    avatarModel: mapMedia(doc.avatarModel),
    avatarPortrait: mapMedia(doc.avatarPortrait),
    heroPoster: mapMedia(doc.heroPoster),
    heroVideoDesktop: mapVideoPair(doc.heroVideoDesktop),
    heroVideoMobile: mapVideoPair(doc.heroVideoMobile),
    scrubVideo: mapMedia(doc.scrubVideo),
  }
}

import type { MediaAsset } from '../media'

export type VideoPair = { readonly mp4: MediaAsset | null; readonly webm: MediaAsset | null }

export type CinematicMedia = {
  readonly avatarModel: MediaAsset | null
  readonly avatarPortrait: MediaAsset | null
  readonly heroPoster: MediaAsset | null
  readonly heroVideoDesktop: VideoPair
  readonly heroVideoMobile: VideoPair
  readonly scrubVideo: MediaAsset | null
}

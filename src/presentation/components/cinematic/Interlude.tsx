import type { CinematicMedia } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { ScrubVideo } from './ScrubVideo'

/** Transition vidéo entre le hero et « À propos ». Décorative, sans texte ; absente si le CMS n'a pas de vidéo. */
export function Interlude({ cinematic }: { cinematic: CinematicMedia }) {
  if (!cinematic.scrubVideo) return null
  return (
    <section aria-hidden="true" className="container-x section-y">
      <Glass variant="surface" className="overflow-hidden p-2">
        <ScrubVideo
          src={cinematic.scrubVideo.url}
          className="aspect-video w-full rounded-[calc(var(--radius-frame)-0.5rem)] object-cover"
        />
      </Glass>
    </section>
  )
}

'use client'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import Image from 'next/image'
import type { CinematicMedia } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { useHeroStage } from '@/presentation/cinematic/use-hero-stage'
import { useHoloCard } from '@/presentation/cinematic/use-holo-card'
import { useVideoChoreography } from '@/presentation/cinematic/use-video-choreography'
import { cn } from '@/presentation/lib/cn'
import { GlassOrb } from './GlassOrb'
import { HeroVideo } from './HeroVideo'

// Chargé après montage et au repos du navigateur : la 3D ne doit jamais retarder le premier rendu.
const AvatarCanvas = dynamic(() => import('./AvatarCanvas'), { ssr: false })

const FADE = 'absolute inset-0 transition-opacity duration-500'
const IMAGE_SIZES = '(min-width: 1024px) 40vw, 90vw'

type HeroStageProps = { cinematic: CinematicMedia; avatarAlt: string }

/** Cadre média du hero : poster → vidéo → 3D interactive, chaque couche se repliant sur la précédente. */
export function HeroStage({ cinematic, avatarAlt }: HeroStageProps) {
  const scene = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const stage = useHeroStage(cinematic, frame)
  useHoloCard(scene, card)
  // Quand la scène vidéo joue, elle pilote le titre du hero (qui se transforme à son « cling »).
  const onCue = useVideoChoreography(stage.mode)
  const labelled = avatarAlt !== ''
  // Trois niveaux : la scène donne la perspective et la position du pointeur, la carte s'incline,
  // le cadre (que GSAP réduit au scroll) porte les médias et les reflets, découpés par ses coins.
  return (
    <div ref={scene} className="holo-scene">
      <div ref={card} className="holo">
        <div
          ref={frame}
          data-testid="hero-frame"
          data-hero-frame
          data-hero-mode={stage.mode}
          data-hero-ready={stage.ready}
          role={labelled ? 'img' : undefined}
          aria-label={labelled ? avatarAlt : undefined}
          aria-hidden={labelled ? undefined : true}
          className="holo-frame relative isolate aspect-[4/5] overflow-hidden rounded-[var(--radius-frame)]"
        >
          <div aria-hidden="true" className={cn(FADE, stage.showCanvas && 'opacity-0')}>
            {stage.base ? (
              <Image
                src={stage.base.url}
                alt={avatarAlt}
                fill
                priority
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center">
                <GlassOrb size="62%" />
              </div>
            )}
          </div>
          {stage.video && (
            <HeroVideo
              sources={stage.video}
              poster={stage.base}
              active={stage.active}
              visible={stage.showVideo}
              onEnded={stage.onIntroEnded}
              onCue={onCue}
            />
          )}
          {stage.mountCanvas && stage.model && (
            <div aria-hidden="true" className={cn(FADE, !stage.showCanvas && 'opacity-0')}>
              <AvatarCanvas
                url={stage.model}
                active={stage.active}
                mobile={stage.mobile}
                onReady={stage.onCanvasReady}
              />
            </div>
          )}
          <span aria-hidden="true" className="holo-shine" />
          <span aria-hidden="true" className="holo-sparkle" />
          <Glass
            variant="surface"
            aria-hidden="true"
            className="glass--rim pointer-events-none absolute inset-0"
          />
        </div>
      </div>
    </div>
  )
}

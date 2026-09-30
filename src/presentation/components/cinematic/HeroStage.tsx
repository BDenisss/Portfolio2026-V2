'use client'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import Image from 'next/image'
import type { CinematicMedia } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { useHeroStage } from '@/presentation/cinematic/use-hero-stage'
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
  const frame = useRef<HTMLDivElement>(null)
  const stage = useHeroStage(cinematic, frame)
  return (
    <div
      ref={frame}
      data-testid="hero-frame"
      data-hero-frame
      data-hero-mode={stage.mode}
      data-hero-ready={stage.ready}
      role="img"
      aria-label={avatarAlt}
      className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-frame)]"
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
          loop={stage.loopVideo}
          active={stage.active}
          visible={stage.showVideo}
          onEnded={stage.onIntroEnded}
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
      <Glass
        variant="surface"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-transparent backdrop-filter-none"
      />
    </div>
  )
}

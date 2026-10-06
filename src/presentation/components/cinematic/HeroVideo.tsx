'use client'
import { useEffect, useRef } from 'react'
import type { MediaAsset, VideoPair } from '@/domain'
import { hasReachedCue } from '@/presentation/cinematic/hero-choreography'

type HeroVideoProps = {
  sources: VideoPair
  poster: MediaAsset | null
  active: boolean
  visible: boolean
  onEnded: () => void
  /** Appelé une seule fois, à l'image où la lecture atteint le « cling » de la scène. */
  onCue?: () => void
}

/**
 * La scène ne se joue qu'une fois : pas de boucle, et pas de lecture automatique avant d'être à l'écran
 * (sinon elle serait finie quand le visiteur arrive jusqu'à elle, par exemple sur mobile où l'avatar est sous le texte).
 */
export function HeroVideo({ sources, poster, active, visible, onEnded, onCue }: HeroVideoProps) {
  const video = useRef<HTMLVideoElement>(null)
  const finished = useRef(false)
  const cueFired = useRef(false)

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (!active || finished.current) {
      element.pause()
      return
    }
    element.play().catch(() => {
      // Lecture automatique refusée par le navigateur : le poster reste affiché, sans erreur visible.
    })
  }, [active])

  // `timeupdate` ne tire que ~4 fois par seconde : on lit le temps à chaque image pour tomber juste sur le cling.
  useEffect(() => {
    const element = video.current
    if (!element || !active || !onCue || cueFired.current) return
    let frame = 0
    const watch = () => {
      if (hasReachedCue(element.currentTime)) {
        cueFired.current = true
        onCue()
        return
      }
      frame = requestAnimationFrame(watch)
    }
    frame = requestAnimationFrame(watch)
    return () => cancelAnimationFrame(frame)
  }, [active, onCue])

  const handleEnded = () => {
    finished.current = true
    onEnded()
  }

  return (
    <video
      ref={video}
      muted
      playsInline
      preload="auto"
      poster={poster?.url}
      onEnded={handleEnded}
      aria-hidden="true"
      className="absolute inset-0 size-full object-cover transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {sources.webm && <source src={sources.webm.url} type="video/webm" />}
      {sources.mp4 && <source src={sources.mp4.url} type="video/mp4" />}
    </video>
  )
}

'use client'
import { useEffect, useRef } from 'react'
import type { MediaAsset, VideoPair } from '@/domain'

type HeroVideoProps = {
  sources: VideoPair
  poster: MediaAsset | null
  loop: boolean
  active: boolean
  visible: boolean
  onEnded: () => void
}

export function HeroVideo({ sources, poster, loop, active, visible, onEnded }: HeroVideoProps) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (!active) {
      element.pause()
      return
    }
    element.play().catch(() => {
      // Lecture automatique refusée par le navigateur : le poster reste affiché, sans erreur visible.
    })
  }, [active])

  return (
    <video
      ref={video}
      muted
      playsInline
      autoPlay
      loop={loop}
      preload="metadata"
      poster={poster?.url}
      onEnded={onEnded}
      aria-hidden="true"
      className="absolute inset-0 size-full object-cover transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {sources.webm && <source src={sources.webm.url} type="video/webm" />}
      {sources.mp4 && <source src={sources.mp4.url} type="video/mp4" />}
    </video>
  )
}

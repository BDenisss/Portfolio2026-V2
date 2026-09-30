'use client'
import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '@/presentation/lib/gsap'

const EASE_FACTOR = 0.15
const MIN_GAP_SECONDS = 0.01

type ScrubVideoProps = { src: string; className?: string }

/** Vidéo « all-intra » dont la position suit le scroll. Sous reduced-motion : première image, sans scrub. */
export function ScrubVideo({ src, className }: ScrubVideoProps) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const element = video.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let target = 0
    let frame = 0
    let trigger: ScrollTrigger | undefined

    const follow = (): void => {
      const gap = target - element.currentTime
      if (Math.abs(gap) > MIN_GAP_SECONDS) element.currentTime += gap * EASE_FACTOR
      frame = requestAnimationFrame(follow)
    }
    const arm = (): void => {
      trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          target = self.progress * element.duration
        },
      })
      frame = requestAnimationFrame(follow)
    }

    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) arm()
    else element.addEventListener('loadedmetadata', arm, { once: true })

    return () => {
      element.removeEventListener('loadedmetadata', arm)
      trigger?.kill()
      cancelAnimationFrame(frame)
    }
  }, [src])

  return (
    <video
      ref={video}
      src={src}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className={className}
    />
  )
}

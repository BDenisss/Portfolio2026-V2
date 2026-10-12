'use client'
import { useEffect, useState } from 'react'
import {
  useHeroChoreography,
  type ChoreographyPhase,
} from '@/presentation/cinematic/hero-choreography-context'
import { cn } from '@/presentation/lib/cn'
import { usePrefersReducedMotion } from '@/presentation/lib/use-prefers-reduced-motion'

const ROTATION_INTERVAL_MS = 3200
// Durée de l'animation de sortie de l'ancien titre (voir `.hero-title-out`).
const OUTGOING_MS = 350
// Entrée du premier titre : juste après « Denis Bucspun » (voir Hero.tsx).
const INTRO_DELAY_S = '0.5'
const GRADIENT_TEXT =
  'inline-block bg-linear-to-r from-[var(--accent-strong)] to-[var(--accent)] bg-clip-text text-transparent'

// Étincelles décoratives autour du titre : position (%), direction d'envol (rem) et retard (ms).
const SPARKLES = [
  { x: 6, y: 10, dx: -1.2, dy: -1.4, delay: 0 },
  { x: 28, y: -25, dx: -0.6, dy: -1.8, delay: 60 },
  { x: 52, y: 0, dx: 0.4, dy: -2, delay: 20 },
  { x: 74, y: -20, dx: 1, dy: -1.6, delay: 90 },
  { x: 92, y: 15, dx: 1.6, dy: -1, delay: 40 },
  { x: 100, y: 65, dx: 1.8, dy: 0.6, delay: 110 },
] as const

function TitleSparkles() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {SPARKLES.map(({ x, y, dx, dy, delay }) => (
        <i
          key={`${x}-${y}`}
          className="hero-sparkle"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              '--dx': `${dx}rem`,
              '--dy': `${dy}rem`,
              animationDelay: `${delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  )
}

type RotationInput = {
  count: number
  paused: boolean
  reducedMotion: boolean
  phase: ChoreographyPhase
}

/** Le titre alterne seul tant que la vidéo du hero ne le pilote pas (sauf au survol et sous reduced-motion). */
const shouldRotate = ({ count, paused, reducedMotion, phase }: RotationInput): boolean =>
  count > 1 && !paused && !reducedMotion && phase === 'idle'

function useRotations(enabled: boolean): number {
  const [rotations, setRotations] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => setRotations((current) => current + 1), ROTATION_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [enabled])
  return rotations
}

/** Titre affiché : le premier jusqu'au cling, le dernier après ; sans vidéo, celui de la rotation. */
function titleIndex(phase: ChoreographyPhase, count: number, rotations: number): number {
  if (phase === 'swapped') return Math.max(count - 1, 0)
  if (phase === 'armed') return 0
  return rotations % Math.max(count, 1)
}

function titleAnimation(phase: ChoreographyPhase, rotations: number): string | undefined {
  if (phase === 'swapped') return 'hero-title-magic'
  // Le premier titre s'affiche sans fondu (texte de tête de page) ; seuls les changements s'animent.
  return phase === 'idle' && rotations > 0 ? 'hero-title-in' : undefined
}

/**
 * Clé du titre affiché : un nouvel élément (donc une nouvelle animation) à chaque rotation et à la transformation,
 * mais pas au passage idle → armed, sinon le premier titre serait recréé en pleine animation d'entrée.
 */
const titleKey = (phase: ChoreographyPhase, rotations: number): string =>
  phase === 'swapped' ? 'swapped' : `title-${rotations}`

/** Seul le premier titre, celui du chargement, monte mot par mot derrière un masque (comme le nom). */
const introSplit = (phase: ChoreographyPhase, rotations: number) =>
  phase !== 'swapped' && rotations === 0
    ? { 'data-split': 'mask', 'data-split-delay': INTRO_DELAY_S }
    : {}

/** Garde l'ancien titre à l'écran le temps de sa sortie, une fois la transformation déclenchée. */
function useOutgoingTitle(swapped: boolean, title: string | null): string | null {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!swapped) return
    const timer = setTimeout(() => setGone(true), OUTGOING_MS)
    return () => clearTimeout(timer)
  }, [swapped])
  return swapped && !gone ? title : null
}

type RotatingTitleProps = { titles: readonly string[]; label: string }

/**
 * Titre qui alterne les métiers. Le rendu serveur affiche le premier ; tous sont lus par les lecteurs d'écran.
 * Figé sous reduced-motion et au survol. Quand la vidéo du hero joue, c'est elle qui le pilote : il attend le
 * « cling » de l'avatar, se transforme en dernier titre avec un effet de magie, puis ne bouge plus.
 */
export function RotatingTitle({ titles, label }: RotatingTitleProps) {
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const { phase } = useHeroChoreography()
  const rotations = useRotations(
    shouldRotate({ count: titles.length, paused, reducedMotion, phase }),
  )
  const outgoing = useOutgoingTitle(phase === 'swapped', titles[0] ?? null)

  return (
    <p
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="font-display relative text-[clamp(1.5rem,0.8rem+3vw,2.75rem)] leading-tight font-semibold"
    >
      <span className="sr-only">
        {label} {titles.join(', ')}
      </span>
      {/* Boîte à la largeur du texte : l'ancien titre et les étincelles se positionnent par rapport à lui. */}
      <span className="relative inline-block">
        <span
          key={titleKey(phase, rotations)}
          aria-hidden="true"
          {...introSplit(phase, rotations)}
          className={cn(GRADIENT_TEXT, titleAnimation(phase, rotations))}
        >
          {titles[titleIndex(phase, titles.length, rotations)]}
        </span>
        {outgoing && (
          <span
            aria-hidden="true"
            className={cn(GRADIENT_TEXT, 'hero-title-out absolute top-0 left-0 whitespace-nowrap')}
          >
            {outgoing}
          </span>
        )}
        {phase === 'swapped' && <TitleSparkles />}
      </span>
    </p>
  )
}

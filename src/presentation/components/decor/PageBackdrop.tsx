import type { CSSProperties } from 'react'

type Shape = { x: string; y: string; size: string; tone: string; duration?: string; delay?: string }

// Couleurs = tokens de teinte (tokens.css) ; positions en % de l'écran, le décor est fixe derrière la page.
const BLOBS: readonly Shape[] = [
  { x: '-14%', y: '-12%', size: '52rem', tone: 'var(--tint-violet)', duration: '42s' },
  { x: '62%', y: '-10%', size: '44rem', tone: 'var(--tint-blue)', duration: '36s', delay: '-8s' },
  { x: '48%', y: '48%', size: '50rem', tone: 'var(--tint-teal)', duration: '48s', delay: '-16s' },
  { x: '-10%', y: '58%', size: '40rem', tone: 'var(--tint-pink)', duration: '40s', delay: '-4s' },
  { x: '78%', y: '78%', size: '34rem', tone: 'var(--tint-amber)', duration: '44s', delay: '-22s' },
]

const ORBS: readonly Shape[] = [
  { x: '84%', y: '14%', size: '9rem', tone: 'var(--tint-blue)', duration: '24s' },
  { x: '6%', y: '70%', size: '6rem', tone: 'var(--tint-violet)', duration: '19s', delay: '-6s' },
  { x: '70%', y: '62%', size: '4.5rem', tone: 'var(--tint-teal)', duration: '26s', delay: '-11s' },
]

const style = ({ x, y, size, tone, duration, delay }: Shape): CSSProperties =>
  ({
    '--x': x,
    '--y': y,
    '--size': size,
    '--tone': tone,
    '--duration': duration,
    '--delay': delay,
  }) as CSSProperties

/** Décor décoratif (aucun contenu) : halos, rubans nacrés et sphères de verre derrière tout le site. */
export function PageBackdrop() {
  return (
    <div aria-hidden="true" className="decor">
      {BLOBS.map((blob) => (
        <span key={`${blob.x}-${blob.y}`} className="decor-blob" style={style(blob)} />
      ))}
      <svg
        className="decor-ribbons"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="decor-ribbon-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--tint-violet)" stopOpacity="0" />
            <stop offset="0.35" stopColor="var(--tint-violet)" stopOpacity="0.32" />
            <stop offset="0.65" stopColor="var(--tint-blue)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--tint-teal)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="decor-ribbon-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--tint-pink)" stopOpacity="0" />
            <stop offset="0.4" stopColor="var(--tint-pink)" stopOpacity="0.26" />
            <stop offset="0.7" stopColor="var(--tint-violet)" stopOpacity="0.26" />
            <stop offset="1" stopColor="var(--tint-blue)" stopOpacity="0" />
          </linearGradient>
          <filter id="decor-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g filter="url(#decor-soft)" fill="none" strokeLinecap="round">
          <path
            d="M -80 640 C 240 380, 520 760, 820 520 S 1280 260, 1540 420"
            stroke="url(#decor-ribbon-a)"
            strokeWidth="64"
          />
          <path
            d="M -60 260 C 300 80, 560 420, 900 250 S 1300 80, 1520 220"
            stroke="url(#decor-ribbon-b)"
            strokeWidth="48"
          />
          <path
            d="M 120 900 C 420 620, 700 860, 1040 640 S 1400 520, 1560 700"
            stroke="url(#decor-ribbon-a)"
            strokeWidth="36"
            opacity="0.7"
          />
        </g>
      </svg>
      {ORBS.map((orb) => (
        <span key={`${orb.x}-${orb.y}`} className="decor-orb" style={style(orb)} />
      ))}
    </div>
  )
}

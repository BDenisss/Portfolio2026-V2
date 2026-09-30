import { contrastRatio } from '@/presentation/design/contrast'

const GLASS_SURFACE = '#F9F8FC' // verre 62 % sur --bg (voir MASTER.md)
const MIN_ICON_CONTRAST = 3 // seuil WCAG des composants graphiques

/** Couleur de marque d'une icône si elle reste lisible sur le verre, sinon l'encre du site. */
export function iconColor(hex: string, surface: string = GLASS_SURFACE): string {
  const color = `#${hex.replace('#', '').toUpperCase()}`
  return contrastRatio(color, surface) >= MIN_ICON_CONTRAST ? color : 'var(--ink)'
}

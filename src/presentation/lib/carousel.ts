/**
 * Position d'une diapositive par rapport à l'active, en boucle : 0 au centre, -1 à gauche, 1 à droite.
 * Avec 3 projets, chaque côté a toujours un voisin : pas de « retour en arrière » au bout de la liste.
 */
export function slideOffset(index: number, active: number, count: number): number {
  const half = Math.floor(count / 2)
  return ((((index - active + half) % count) + count) % count) - half
}

export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count
}

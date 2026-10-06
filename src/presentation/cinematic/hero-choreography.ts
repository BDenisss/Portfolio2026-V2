/**
 * Seconde de la scène du hero où l'avatar fait « cling » (l'étincelle apparaît au bout de son doigt) : c'est là
 * que le titre se transforme. Liée à la vidéo actuelle ; une autre scène demande un autre instant.
 */
export const TITLE_SWAP_CUE_SECONDS = 3.5

export const hasReachedCue = (currentTime: number, cue: number = TITLE_SWAP_CUE_SECONDS): boolean =>
  currentTime >= cue

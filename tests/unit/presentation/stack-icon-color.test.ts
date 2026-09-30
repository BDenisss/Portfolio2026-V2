import { describe, expect, it } from 'vitest'
import { iconColor } from '@/presentation/lib/stack-icon-color'

describe('iconColor', () => {
  it('garde la couleur de marque si elle contraste (≥ 3:1) avec le verre', () => {
    expect(iconColor('3178C6')).toBe('#3178C6') // bleu TypeScript, 4,29:1
  })
  it('bascule sur --ink pour une couleur trop claire', () => {
    expect(iconColor('F7DF1E')).toBe('var(--ink)') // jaune JavaScript, ~1.3:1
  })
  it('bascule sur --ink juste sous le seuil de 3:1', () => {
    expect(iconColor('2496ED')).toBe('var(--ink)') // bleu Docker, 2,98:1
  })
  it('accepte le # et la casse', () => {
    expect(iconColor('#3178c6')).toBe('#3178C6')
  })
})

import { describe, expect, it } from 'vitest'
import { lexicalFromParagraphs } from '@/infrastructure/seed/lexical'

describe('lexicalFromParagraphs', () => {
  it('construit un état Lexical valide avec un paragraphe par texte', () => {
    const state = lexicalFromParagraphs(['Un', 'Deux'])
    expect(state.root.type).toBe('root')
    expect(state.root.children).toHaveLength(2)
    const second = state.root.children[1] as unknown as { children: Array<{ text: string }> }
    expect(second.children[0]!.text).toBe('Deux')
  })
})

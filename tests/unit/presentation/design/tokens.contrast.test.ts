import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { composite, contrastRatio } from '@/presentation/design/contrast'
import { parseTokens } from '@/presentation/design/tokens'

const css = readFileSync('src/presentation/styles/tokens.css', 'utf8')
const t = parseTokens(css)
const glass = composite('#FFFFFF', 0.62, t.bg!)
const glassSubtle = composite('#FFFFFF', 0.4, t.bg!)

const TEXT: Array<[string, string, string]> = [
  ['ink', 'bg', t.bg!],
  ['ink', 'glass', glass],
  ['ink-2', 'bg', t.bg!],
  ['ink-2', 'glass', glass],
  ['ink-muted', 'bg', t.bg!],
  ['ink-muted', 'glass', glass],
  ['ink-muted', 'glass-subtle', glassSubtle],
  ['accent-text', 'bg', t.bg!],
  ['accent-text', 'glass', glass],
  ['accent-text', 'glass-subtle', glassSubtle],
  ['danger', 'glass', glass],
  ['success', 'glass', glass],
]

describe('tokens.css — contrastes texte ≥ 4.5', () => {
  it.each(TEXT)('%s sur %s', (name, _on, bg) => {
    expect(contrastRatio(t[name]!, bg)).toBeGreaterThanOrEqual(4.5)
  })
  it('blanc sur bouton ink ≥ 7', () => {
    expect(contrastRatio('#FFFFFF', t.ink!)).toBeGreaterThanOrEqual(7)
  })
  it('blanc sur accent-strong ≥ 4.5', () => {
    expect(contrastRatio('#FFFFFF', t['accent-strong']!)).toBeGreaterThanOrEqual(4.5)
  })
  it('--accent (décoratif) ≥ 3 sur bg mais documenté < 4.5', () => {
    const ratio = contrastRatio(t.accent!, t.bg!)
    expect(ratio).toBeGreaterThanOrEqual(3)
    expect(ratio).toBeLessThan(4.5)
  })
})

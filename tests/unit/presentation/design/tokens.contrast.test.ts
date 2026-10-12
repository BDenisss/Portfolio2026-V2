import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { composite, contrastRatio } from '@/presentation/design/contrast'
import { parseTokens } from '@/presentation/design/tokens'

const css = readFileSync('src/presentation/styles/tokens.css', 'utf8')
const t = parseTokens(css)
// Opacité du voile blanc lue dans les tokens : le test suit le CSS au lieu de valeurs recopiées.
const alphaOf = (token: string): number => {
  const declaration = new RegExp('--' + token + String.raw`:\s*rgb\([^/]*/\s*([\d.]+)\s*\)`).exec(
    css,
  )
  return Number(declaration?.[1])
}
const glass = composite('#FFFFFF', alphaOf('glass-fill'), t.bg!)
const glassSubtle = composite('#FFFFFF', alphaOf('glass-fill-subtle'), t.bg!)
// Pire fond du dégradé de page, échantillonné sous le texte rendu (revue T19, F3) : plus sombre que --bg.
const gradientWorst = '#D3D2F6'
const glassOnWorst = composite('#FFFFFF', alphaOf('glass-fill'), gradientWorst)
// Verre liquide : teinte grise (--lg-tint) à --lg-tint-amount, sans voile blanc, sur le fond et sur le pire dégradé.
const tintAmount = Number(/--lg-tint-amount:\s*([\d.]+)%/.exec(css)?.[1]) / 100
const liquidGlass = composite(t['lg-tint']!, tintAmount, t.bg!)
const liquidGlassOnWorst = composite(t['lg-tint']!, tintAmount, gradientWorst)

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
  ['accent-text', 'gradient-worst', gradientWorst],
  ['ink-2', 'gradient-worst', gradientWorst],
  ['ink-muted', 'gradient-worst', gradientWorst],
  ['accent-text', 'glass-on-worst', glassOnWorst],
  ['ink-muted', 'glass-on-worst', glassOnWorst],
  ['ink', 'liquid-glass-on-worst', liquidGlassOnWorst],
  ['ink-2', 'liquid-glass', liquidGlass],
  ['ink-2', 'liquid-glass-on-worst', liquidGlassOnWorst],
  ['ink-muted', 'liquid-glass', liquidGlass],
  ['ink-muted', 'liquid-glass-on-worst', liquidGlassOnWorst],
  ['accent-text', 'liquid-glass-on-worst', liquidGlassOnWorst],
  ['danger', 'glass', glass],
  ['success', 'glass', glass],
]

describe('tokens.css : contrastes texte ≥ 4.5', () => {
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

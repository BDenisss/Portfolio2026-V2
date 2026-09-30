import { describe, expect, it } from 'vitest'
import {
  composite,
  contrastRatio,
  hexToRgb,
  relativeLuminance,
} from '@/presentation/design/contrast'

describe('contrast', () => {
  it('parse le hex', () => {
    expect(hexToRgb('#0B0B14')).toEqual([11, 11, 20])
    expect(hexToRgb('fff')).toEqual([255, 255, 255])
  })
  it('luminance noir/blanc', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5)
  })
  it('ratio noir/blanc = 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })
  it('ratio symétrique', () => {
    expect(contrastRatio('#6D3FE0', '#EEEDF7')).toBeCloseTo(contrastRatio('#EEEDF7', '#6D3FE0'), 5)
  })
  it('composite blanc 62 % sur #EEEDF7 = #F9F8FC', () => {
    expect(composite('#FFFFFF', 0.62, '#EEEDF7')).toBe('#F9F8FC')
  })
})

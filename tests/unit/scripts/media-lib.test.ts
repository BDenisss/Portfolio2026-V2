import { describe, expect, it } from 'vitest'
import { BUDGETS, buildFfmpegArgs, checkBudget } from '../../../scripts/media/lib.mjs'

describe('checkBudget', () => {
  it('ok sous le budget, ko au-dessus', () => {
    expect(checkBudget('glb', 2_900_000).ok).toBe(true)
    expect(checkBudget('glb', 3_100_000).ok).toBe(false)
    expect(BUDGETS['hero-mobile']).toBe(2_000_000)
  })
  it('accepte exactement le budget', () => {
    expect(checkBudget('poster', 150_000).ok).toBe(true)
  })
  it('renvoie le budget et la taille mesurée', () => {
    expect(checkBudget('scrub', 7_000_000)).toEqual({
      ok: false,
      budget: 6_000_000,
      bytes: 7_000_000,
    })
  })
})

describe('buildFfmpegArgs', () => {
  it('h264 : faststart, sans audio, yuv420p', () => {
    const args: string[] = buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.mp4', 'h264')
    expect(args).toEqual(
      expect.arrayContaining([
        '-c:v',
        'libx264',
        '-an',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
      ]),
    )
    expect(args.join(' ')).toMatch(/scale=-2:1080/)
  })
  it('mobile : 9:16 720 de large', () => {
    expect(buildFfmpegArgs('hero-mobile', 'in.mp4', 'out.mp4', 'h264').join(' ')).toMatch(
      /scale=720:-2/,
    )
  })
  it('scrub : all-intra (-g 1)', () => {
    const args: string[] = buildFfmpegArgs('scrub', 'in.mp4', 'out.mp4', 'h264')
    expect(args[args.indexOf('-g') + 1]).toBe('1')
  })
  it('hero : un point d’accès toutes les 48 images', () => {
    const args: string[] = buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.mp4', 'h264')
    expect(args[args.indexOf('-g') + 1]).toBe('48')
  })
  it('vp9 : libvpx-vp9', () => {
    expect(buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.webm', 'vp9')).toEqual(
      expect.arrayContaining(['-c:v', 'libvpx-vp9', '-b:v', '0']),
    )
  })
  it('input et output sont en place', () => {
    const args: string[] = buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.mp4', 'h264')
    expect(args[args.indexOf('-i') + 1]).toBe('in.mp4')
    expect(args[args.length - 1]).toBe('out.mp4')
  })
  it('refuse un preset inconnu', () => {
    expect(() => buildFfmpegArgs('inconnu' as never, 'in.mp4', 'out.mp4', 'h264')).toThrow(
      /preset/i,
    )
  })
})

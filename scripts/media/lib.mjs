// Budgets et commandes partagés par les scripts d'optimisation média (voir docs/higgsfield).

/** Poids maximum, en octets, de chaque type de média déposé dans le CMS. */
export const BUDGETS = {
  poster: 150_000,
  glb: 3_000_000,
  'hero-desktop': 4_000_000,
  'hero-mobile': 2_000_000,
  scrub: 6_000_000,
}

/**
 * @param {keyof typeof BUDGETS} kind
 * @param {number} bytes
 * @returns {{ ok: boolean, budget: number, bytes: number }}
 */
export function checkBudget(kind, bytes) {
  const budget = BUDGETS[kind]
  return { ok: bytes <= budget, budget, bytes }
}

const SCALES = {
  'hero-desktop': 'scale=-2:1080',
  'hero-mobile': 'scale=720:-2',
  scrub: 'scale=1280:-2',
}

// CRF : plus bas = plus fidèle. Le scrub est « all-intra » (une image clé par image), donc plus lourd à qualité égale.
const H264_CRF = { hero: '24', scrub: '26' }
const VP9_CRF = '34'
const HERO_GOP = '48'
const SCRUB_GOP = '1'

/**
 * @param {'hero-desktop' | 'hero-mobile' | 'scrub'} preset
 * @param {string} input
 * @param {string} output
 * @param {'h264' | 'vp9'} codec
 * @returns {string[]}
 */
export function buildFfmpegArgs(preset, input, output, codec) {
  const scale = SCALES[preset]
  if (!scale)
    throw new Error(`preset inconnu : « ${preset} » (attendu : ${Object.keys(SCALES).join(', ')})`)
  const common = ['-y', '-i', input, '-vf', scale, '-an']
  if (codec === 'vp9') {
    return [
      ...common,
      '-c:v',
      'libvpx-vp9',
      '-crf',
      VP9_CRF,
      '-b:v',
      '0',
      '-pix_fmt',
      'yuv420p',
      output,
    ]
  }
  const isScrub = preset === 'scrub'
  return [
    ...common,
    '-c:v',
    'libx264',
    '-crf',
    isScrub ? H264_CRF.scrub : H264_CRF.hero,
    '-preset',
    'slow',
    '-g',
    isScrub ? SCRUB_GOP : HERO_GOP,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    output,
  ]
}

/** @param {number} bytes */
export function formatSize(bytes) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(2)} Mo`
    : `${Math.round(bytes / 1000)} Ko`
}

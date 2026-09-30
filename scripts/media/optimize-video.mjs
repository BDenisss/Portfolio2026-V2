// Encode une vidéo du hero (mp4 H.264 + webm VP9) et vérifie chaque budget de poids.
// Usage : pnpm media:optimize:video -- <in.mp4> --preset hero-desktop|hero-mobile|scrub [--outdir media-out]
import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'
import { buildFfmpegArgs, checkBudget, formatSize } from './lib.mjs'

const PRESETS = ['hero-desktop', 'hero-mobile', 'scrub']
const DEFAULT_OUTDIR = 'media-out'

function option(args, name, fallback) {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

const args = process.argv.slice(2).filter((value) => value !== '--')
const preset = option(args, '--preset')
const outdir = option(args, '--outdir', DEFAULT_OUTDIR)
const input = args.find(
  (value, index) =>
    !value.startsWith('--') && args[index - 1] !== '--preset' && args[index - 1] !== '--outdir',
)

if (!input || !PRESETS.includes(preset)) {
  console.error(
    `Usage : pnpm media:optimize:video -- <in.mp4> --preset ${PRESETS.join('|')} [--outdir media-out]`,
  )
  process.exit(2)
}

mkdirSync(outdir, { recursive: true })
// Le scrub n'a pas de variante webm : il est lu image par image, le poids vient de l'all-intra.
const targets =
  preset === 'scrub'
    ? [['h264', 'mp4']]
    : [
        ['h264', 'mp4'],
        ['vp9', 'webm'],
      ]
let failed = false

for (const [codec, extension] of targets) {
  const output = join(outdir, `${preset}.${extension}`)
  const run = spawnSync(ffmpegPath, buildFfmpegArgs(preset, input, output, codec), {
    stdio: 'inherit',
  })
  if (run.status !== 0) {
    console.error(`ffmpeg a échoué pour ${output}.`)
    process.exit(run.status ?? 1)
  }
  const { ok, budget, bytes } = checkBudget(preset, statSync(output).size)
  console.log(
    `${ok ? '✅' : '⚠️ '} ${output} : ${formatSize(bytes)} (budget ${formatSize(budget)})`,
  )
  failed ||= !ok
}
if (failed) process.exit(1)

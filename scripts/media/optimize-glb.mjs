// Compresse un avatar GLB (meshopt + textures WebP) et vérifie son budget de poids.
// Usage : pnpm media:optimize:glb -- <in.glb> [--out media-out/avatar.glb]
import { mkdirSync, statSync } from 'node:fs'
import { dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { checkBudget, formatSize } from './lib.mjs'

const TEXTURE_SIZE = '1024'
const DEFAULT_OUTPUT = 'media-out/avatar.glb'

function parseArguments(argv) {
  const args = argv.filter((value) => value !== '--')
  const outIndex = args.indexOf('--out')
  const output = outIndex === -1 ? DEFAULT_OUTPUT : args[outIndex + 1]
  const input = args.find((value, index) => !value.startsWith('--') && index !== outIndex + 1)
  return { input, output }
}

const { input, output } = parseArguments(process.argv.slice(2))
if (!input || !output) {
  console.error('Usage : pnpm media:optimize:glb -- <in.glb> [--out media-out/avatar.glb]')
  process.exit(2)
}

mkdirSync(dirname(output), { recursive: true })
// Meshopt uniquement : drei l'embarque, alors que Draco irait chercher son décodeur sur un CDN.
const result = spawnSync(
  'pnpm',
  [
    'exec',
    'gltf-transform',
    'optimize',
    input,
    output,
    '--compress',
    'meshopt',
    '--texture-compress',
    'webp',
    '--texture-size',
    TEXTURE_SIZE,
  ],
  { stdio: 'inherit' },
)
if (result.status !== 0) {
  console.error('gltf-transform a échoué.')
  process.exit(result.status ?? 1)
}

const { ok, budget, bytes } = checkBudget('glb', statSync(output).size)
console.log(`${ok ? '✅' : '⚠️ '} ${output} : ${formatSize(bytes)} (budget ${formatSize(budget)})`)
if (!ok) {
  console.log(
    'Pour alléger : baisse --texture-size dans ce script, ou décime le maillage avec `gltf-transform simplify`.',
  )
  process.exit(1)
}

// Compresse un avatar GLB (meshopt + textures WebP) et vérifie son budget de poids.
// Usage : pnpm media:optimize:glb -- <in.glb> [--out media-out/avatar.glb]
import { mkdirSync, statSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { checkBudget, formatSize, parseGlbArguments } from './lib.mjs'

const TEXTURE_SIZE = '1024'
// Lancé avec Node, sans shell : `pnpm` est un .cmd sous Windows et `spawnSync('pnpm')` n'y trouve rien.
const GLTF_TRANSFORM_CLI = fileURLToPath(
  new URL('../../node_modules/@gltf-transform/cli/bin/cli.js', import.meta.url),
)

const { input, output } = parseGlbArguments(process.argv.slice(2))
if (!input || !output) {
  console.error('Usage : pnpm media:optimize:glb -- <in.glb> [--out media-out/avatar.glb]')
  process.exit(2)
}

mkdirSync(dirname(output), { recursive: true })
// Meshopt uniquement : drei l'embarque, alors que Draco irait chercher son décodeur sur un CDN.
const result = spawnSync(
  process.execPath,
  [
    GLTF_TRANSFORM_CLI,
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

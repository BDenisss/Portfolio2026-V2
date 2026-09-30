import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

export type Layer =
  'domain' | 'application' | 'infrastructure' | 'composition' | 'presentation' | 'app'

export const SRC = resolve('src')
const LAYERS: readonly Layer[] = [
  'domain',
  'application',
  'infrastructure',
  'composition',
  'presentation',
  'app',
]

/** Règle de dépendance : pour chaque couche, les couches qu'elle a le droit d'importer. */
export const ALLOWED_LAYERS: Readonly<Record<Layer, readonly Layer[]>> = {
  domain: ['domain'],
  application: ['domain', 'application'],
  infrastructure: ['domain', 'application', 'infrastructure'],
  composition: ['domain', 'application', 'infrastructure', 'composition'],
  presentation: ['domain', 'application', 'presentation'],
  app: ['domain', 'application', 'presentation', 'composition', 'app'],
}

/** Couches qui n'importent AUCUN paquet npm ni module `node:`. */
const PURE_LAYERS: readonly Layer[] = ['domain', 'application']

/** Admin et API Payload : code de livraison copié du gabarit officiel, hors règle. */
const IGNORED_DIRECTORY = '(payload)'

const IMPORT_PATTERN =
  /(?:^|\n)[ \t]*(?:import|export)\s+(?:type\s+)?(?:[\w*${}\s,]+?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

export type SourceImport = { readonly specifier: string; readonly line: number }

export function importsOf(source: string): SourceImport[] {
  return [...source.matchAll(IMPORT_PATTERN)].flatMap((match) => {
    const specifier = match[1] ?? match[2]
    if (!specifier) return []
    const offset = (match.index ?? 0) + match[0].lastIndexOf(specifier)
    return [{ specifier, line: source.slice(0, offset).split('\n').length }]
  })
}

export function layerOf(absolutePath: string): Layer | null {
  const [top] = relative(SRC, absolutePath).split(sep)
  if (top === 'proxy.ts') return 'app'
  return LAYERS.find((layer) => layer === top) ?? null
}

type Target =
  | { readonly kind: 'layer'; readonly layer: Layer | null }
  | { readonly kind: 'external'; readonly name: string }

function packageName(specifier: string): string {
  if (specifier.startsWith('node:')) return specifier
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? specifier)
}

export function resolveSpecifier(fromFile: string, specifier: string): Target {
  if (specifier.startsWith('@payload-config')) return { kind: 'layer', layer: 'infrastructure' }
  if (specifier.startsWith('@/'))
    return { kind: 'layer', layer: layerOf(join(SRC, specifier.slice(2))) }
  if (specifier.startsWith('.'))
    return { kind: 'layer', layer: layerOf(resolve(dirname(fromFile), specifier)) }
  return { kind: 'external', name: packageName(specifier) }
}

function forbiddenReason(from: Layer, target: Target, specifier: string): string | null {
  if (target.kind === 'external') {
    return PURE_LAYERS.includes(from)
      ? `la couche « ${from} » ne doit importer aucun paquet (importe « ${specifier} »)`
      : null
  }
  if (target.layer === null || ALLOWED_LAYERS[from].includes(target.layer)) return null
  return `la couche « ${from} » ne doit pas dépendre de « ${target.layer} » (importe « ${specifier} »)`
}

export function violationsInSource(file: string, source: string): string[] {
  const from = layerOf(file)
  const where = relative(process.cwd(), file).split(sep).join('/')
  if (from === null) return [`${where}: dossier hors des couches connues (${LAYERS.join(', ')})`]
  return importsOf(source).flatMap(({ specifier, line }) => {
    const reason = forbiddenReason(from, resolveSpecifier(file, specifier), specifier)
    return reason ? [`${where}:${line} — ${reason}`] : []
  })
}

export function sourceFiles(directory: string = SRC): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return name === IGNORED_DIRECTORY ? [] : sourceFiles(path)
    return /\.tsx?$/.test(name) && !name.endsWith('.d.ts') ? [path] : []
  })
}

export function findViolations(files: readonly string[] = sourceFiles()): string[] {
  return files.flatMap((file) => violationsInSource(file, readFileSync(file, 'utf8')))
}

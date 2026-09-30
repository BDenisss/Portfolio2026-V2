import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findViolations, importsOf, SRC, violationsInSource } from '../support/architecture'

const inLayer = (layer: string, source: string): string[] => violationsInSource(join(SRC, layer, 'file.ts'), source)

describe('règle de dépendance (Clean Architecture)', () => {
  it('aucune couche de src/ n’importe ce qui lui est interdit', () => {
    expect(findViolations()).toEqual([])
  })
})

describe('analyse des imports', () => {
  it('lit import, import type, export … from, import dynamique et import à effet de bord', () => {
    const source = [
      "import { a } from '@/domain'",
      "import type { B } from './b'",
      "export * from '../c'",
      "export { d } from 'pkg'",
      "const e = await import('lazy')",
      "import 'side-effect'",
    ].join('\n')
    expect(importsOf(source).map((i) => i.specifier)).toEqual(['@/domain', './b', '../c', 'pkg', 'lazy', 'side-effect'])
  })

  it('lit un import multi-lignes et donne le bon numéro de ligne', () => {
    const source = "const x = 1\nimport {\n  a,\n  b,\n} from '@/domain'\n"
    expect(importsOf(source)).toEqual([{ specifier: '@/domain', line: 5 }])
  })

  it('ignore ce qui ressemble à un import sans en être un', () => {
    expect(importsOf("export const name = 'from'\nconst message = \"import x from 'y'\"")).toEqual([])
  })
})

describe('détection des violations', () => {
  it('interdit au domaine d’importer l’application (alias comme chemin relatif)', () => {
    expect(inLayer('domain', "import { x } from '@/application/y'")).toHaveLength(1)
    expect(inLayer('domain', "import { x } from '../application/y'")).toHaveLength(1)
  })

  it('interdit au domaine et à l’application d’importer un paquet npm ou node:', () => {
    expect(inLayer('domain', "import { z } from 'zod'")).toHaveLength(1)
    expect(inLayer('application', "import { createHash } from 'node:crypto'")).toHaveLength(1)
  })

  it('interdit à la présentation d’importer l’infrastructure', () => {
    expect(inLayer('presentation', "import { repo } from '@/infrastructure/cms/payload/repo'")).toHaveLength(1)
  })

  it('autorise l’infrastructure à importer l’application, le domaine et des paquets', () => {
    const source = "import type { Port } from '@/application/ports/port'\nimport { Locale } from '@/domain'\nimport { getPayload } from 'payload'"
    expect(inLayer('infrastructure', source)).toEqual([])
  })

  it('autorise la composition à importer l’infrastructure mais pas la présentation', () => {
    expect(inLayer('composition', "import { a } from '@/infrastructure/a'")).toEqual([])
    expect(inLayer('composition', "import { b } from '@/presentation/b'")).toHaveLength(1)
  })

  it('traite @payload-config comme de l’infrastructure', () => {
    expect(inLayer('presentation', "import config from '@payload-config'")).toHaveLength(1)
    expect(inLayer('composition', "import config from '@payload-config'")).toEqual([])
  })

  it('signale un dossier hors des couches connues', () => {
    expect(violationsInSource(join(SRC, 'misc', 'file.ts'), '')).toHaveLength(1)
  })
})

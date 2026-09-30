import { describe, expect, it } from 'vitest'
import type { CollectionConfig, Field } from 'payload'
import { Experiences } from '@/infrastructure/cms/payload/collections/Experiences'
import { Messages } from '@/infrastructure/cms/payload/collections/Messages'
import { Projects } from '@/infrastructure/cms/payload/collections/Projects'
import { Services } from '@/infrastructure/cms/payload/collections/Services'

const field = (collection: CollectionConfig, name: string): Field | undefined =>
  collection.fields.find((candidate) => 'name' in candidate && candidate.name === name)
const isLocalized = (candidate?: Field) =>
  Boolean(candidate && 'localized' in candidate && candidate.localized)

describe('Projects', () => {
  it('active les brouillons et un slug unique', () => {
    expect(Projects.slug).toBe('projects')
    expect(Projects.versions).toMatchObject({ drafts: expect.anything() })
    expect(field(Projects, 'slug')).toMatchObject({ unique: true })
  })
  it('localise titre, accroche, résumé et étude de cas', () => {
    for (const name of ['title', 'tagline', 'summary', 'caseStudy']) {
      expect(isLocalized(field(Projects, name))).toBe(true)
    }
  })
  it('lecture publique limitée aux publiés', () => {
    const read = Projects.access!.read!
    expect(read({ req: { user: null } } as never)).toEqual({ _status: { equals: 'published' } })
    expect(read({ req: { user: { id: 1 } } } as never)).toBe(true)
  })
  it('écriture réservée aux admins', () => {
    for (const operation of ['create', 'update', 'delete'] as const) {
      expect(Projects.access![operation]!({ req: { user: null } } as never)).toBe(false)
    }
  })
})

describe('Services & Experiences', () => {
  it('Services : icône restreinte à la liste blanche', () => {
    const icon = field(Services, 'icon') as { options: Array<{ value: string }> }
    const values = icon.options.map((option) => option.value)
    expect(values).toContain('bot')
    expect(values).not.toContain('nope')
  })
  it('Experiences : highlights localisés dans un tableau', () => {
    const highlights = field(Experiences, 'highlights') as { fields: Field[] }
    const text = highlights.fields.find(
      (candidate) => 'name' in candidate && candidate.name === 'text',
    )
    expect(isLocalized(text)).toBe(true)
  })
})

describe('Messages', () => {
  it('la création publique est refusée (seule la server action crée, overrideAccess)', () => {
    expect(Messages.access!.create!({ req: { user: null } } as never)).toBe(false)
    expect(Messages.access!.create!({ req: { user: { id: 1 } } } as never)).toBe(false)
  })
  it('lecture/mise à jour/suppression : admin uniquement', () => {
    for (const operation of ['read', 'update', 'delete'] as const) {
      expect(Messages.access![operation]!({ req: { user: null } } as never)).toBe(false)
      expect(Messages.access![operation]!({ req: { user: { id: 1 } } } as never)).toBe(true)
    }
  })
})

import { describe, expect, it } from 'vitest'
import type { Field, GlobalConfig } from 'payload'
import { Cinematic } from '@/infrastructure/cms/payload/globals/Cinematic'
import { Site } from '@/infrastructure/cms/payload/globals/Site'

type NamedTab = { name?: string; fields: Field[] }

const tabs = (global: GlobalConfig) => (global.fields[0] as { tabs: NamedTab[] }).tabs
const tab = (name: string) => tabs(Site).find((candidate) => candidate.name === name)
const has = (fields: Field[] | undefined, name: string) =>
  Boolean(fields?.some((candidate) => 'name' in candidate && candidate.name === name))

describe('Site', () => {
  it('expose les 7 onglets nommés du contrat', () => {
    expect(tabs(Site).map((candidate) => candidate.name)).toEqual([
      'identity',
      'hero',
      'about',
      'process',
      'contact',
      'cv',
      'seo',
    ])
  })
  it('le téléphone est masqué par défaut', () => {
    const showPhone = tab('contact')!.fields.find(
      (candidate) => 'name' in candidate && candidate.name === 'showPhone',
    ) as { defaultValue: boolean }
    expect(showPhone.defaultValue).toBe(false)
  })
  it('lecture publique, écriture admin', () => {
    expect(Site.access!.read!({ req: { user: null } } as never)).toBe(true)
    expect(Site.access!.update!({ req: { user: null } } as never)).toBe(false)
  })
  it('hero et process ont les champs attendus', () => {
    const heroFields = [
      'eyebrow',
      'rotatingTitles',
      'ctaPrimary',
      'ctaSecondary',
      'chips',
      'trustedByTitle',
      'trustedBy',
    ]
    for (const name of heroFields) expect(has(tab('hero')!.fields, name)).toBe(true)
    for (const name of ['headline', 'steps']) expect(has(tab('process')!.fields, name)).toBe(true)
  })
})

describe('Cinematic', () => {
  it('expose tous les slots médias', () => {
    const slots = [
      'avatarModel',
      'avatarPortrait',
      'heroPoster',
      'heroVideoDesktop',
      'heroVideoMobile',
      'scrubVideo',
    ]
    for (const name of slots) expect(has(Cinematic.fields, name)).toBe(true)
  })
})

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ctx = { disableRevalidate: true }
const slug = `int-test-${Date.now()}`
let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})
afterAll(async () => {
  await payload.delete({
    collection: 'projects',
    where: { slug: { equals: slug } },
    overrideAccess: true,
    context: ctx,
  })
})

describe('visibilité des projets', () => {
  it('un brouillon est invisible au public ; publié, il devient visible', async () => {
    const created = await payload.create({
      collection: 'projects',
      data: { title: 'Projet test', slug, _status: 'draft' },
      draft: true,
      overrideAccess: true,
      context: ctx,
    })
    const query = {
      collection: 'projects' as const,
      where: { slug: { equals: slug } },
      overrideAccess: false,
      draft: false,
    }
    expect((await payload.find(query)).totalDocs).toBe(0)
    await payload.update({
      collection: 'projects',
      id: created.id,
      data: { _status: 'published' },
      overrideAccess: true,
      context: ctx,
    })
    expect((await payload.find(query)).totalDocs).toBe(1)
  })
})

describe('messages', () => {
  it('création publique refusée', async () => {
    await expect(
      payload.create({
        collection: 'messages',
        data: { name: 'A', email: 'a@b.co', topic: 'other', message: 'Bonjour, ceci est un test.' },
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
  it('lecture publique refusée', async () => {
    await expect(
      payload.find({ collection: 'messages', overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe('users', () => {
  it('inscription publique refusée', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: 'x@y.co', password: 'Passw0rd!Passw0rd!' },
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
})

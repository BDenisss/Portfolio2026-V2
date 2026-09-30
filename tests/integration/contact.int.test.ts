import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SubmitContactMessage } from '@/application/contact/submit-contact-message'
import { PayloadContactMessageRepository } from '@/infrastructure/cms/payload/payload-contact-message-repository'
import { Sha256IpHasher } from '@/infrastructure/contact/sha256-ip-hasher'
import { SystemClock } from '@/infrastructure/system/system-clock'

const IP = '203.0.113.7'
const hasher = new Sha256IpHasher('test')
const ipHash = hasher.hash(IP)
const FIVE_SECONDS = 5000

let payload: Payload
let useCase: SubmitContactMessage

const validRaw = () => ({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  topic: 'project',
  message: 'Bonjour, je voudrais discuter d’un projet.',
  locale: 'fr',
  website: '',
  startedAt: String(Date.now() - FIVE_SECONDS),
})

const storedCount = async () =>
  (
    await payload.count({
      collection: 'messages',
      where: { ipHash: { equals: ipHash } },
      overrideAccess: true,
    })
  ).totalDocs

const cleanUp = () =>
  payload.delete({
    collection: 'messages',
    where: { ipHash: { equals: ipHash } },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

beforeAll(async () => {
  payload = await getPayload({ config })
  useCase = new SubmitContactMessage({
    messages: new PayloadContactMessageRepository(() => Promise.resolve(payload)),
    hasher,
    clock: new SystemClock(),
  })
  await cleanUp()
})
afterAll(cleanUp)

describe.skipIf(!process.env.DATABASE_URI)('contact (base réelle)', () => {
  it('enregistre trois messages valides puis refuse le quatrième (limite de débit)', async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      expect(await useCase.execute({ raw: validRaw(), ip: IP })).toEqual({ status: 'ok' })
    }
    expect(await storedCount()).toBe(3)

    expect(await useCase.execute({ raw: validRaw(), ip: IP })).toEqual({ status: 'rate_limited' })
    expect(await storedCount()).toBe(3)
  })

  it("ne stocke que l'empreinte de l'IP, jamais l'adresse", async () => {
    const { docs } = await payload.find({
      collection: 'messages',
      where: { ipHash: { equals: ipHash } },
      overrideAccess: true,
      limit: 1,
    })
    expect(JSON.stringify(docs[0])).not.toContain(IP)
  })

  it('ne crée rien pour un robot (honeypot), tout en répondant ok', async () => {
    const before = await storedCount()
    const raw = { ...validRaw(), website: 'http://spam' }
    expect(await useCase.execute({ raw, ip: '198.51.100.9' })).toEqual({ status: 'ok' })
    expect(await storedCount()).toBe(before)
  })
})

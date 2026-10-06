import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ctx = { disableRevalidate: true }
const PHONE = 'TEST-PHONE-0000'
const RECIPIENT = 'privee@example.invalid'

let payload: Payload
let original: { phone?: string | null; showPhone?: boolean | null; contactTo?: string | null }

const writeContact = (contact: Record<string, unknown>) =>
  payload.updateGlobal({
    slug: 'site',
    data: { contact },
    overrideAccess: true,
    context: ctx,
  })

const readAsVisitor = async () => {
  const site = await payload.findGlobal({ slug: 'site', overrideAccess: false, depth: 0 })
  return site.contact ?? {}
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const site = await payload.findGlobal({ slug: 'site', overrideAccess: true, depth: 0 })
  original = site.contact ?? {}
})

afterAll(async () => {
  await writeContact({
    phone: original.phone ?? null,
    showPhone: original.showPhone ?? false,
    contactTo: original.contactTo ?? null,
  })
})

describe('confidentialité du contact (API publique : REST, GraphQL et API locale)', () => {
  it('un visiteur ne lit ni le téléphone (showPhone décoché) ni le destinataire des notifications', async () => {
    await writeContact({ phone: PHONE, showPhone: false, contactTo: RECIPIENT })
    const contact = await readAsVisitor()
    expect(contact.phone ?? null).toBeNull()
    expect(contact.contactTo ?? null).toBeNull()
  })

  it('le téléphone devient public seulement quand showPhone est coché ; le destinataire reste privé', async () => {
    await writeContact({ phone: PHONE, showPhone: true, contactTo: RECIPIENT })
    const contact = await readAsVisitor()
    expect(contact.phone).toBe(PHONE)
    expect(contact.contactTo ?? null).toBeNull()
  })

  it('le serveur et l’administrateur lisent toujours le destinataire', async () => {
    await writeContact({ phone: PHONE, showPhone: false, contactTo: RECIPIENT })
    const site = await payload.findGlobal({ slug: 'site', overrideAccess: true, depth: 0 })
    expect(site.contact?.contactTo).toBe(RECIPIENT)
    expect(site.contact?.phone).toBe(PHONE)
  })
})

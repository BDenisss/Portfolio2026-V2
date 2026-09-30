import { describe, expect, it } from 'vitest'
import { SubmitContactMessage } from '@/application/contact/submit-contact-message'
import { MIN_FILL_MS, RATE_MAX } from '@/domain'
import { fakeIpHasher } from '../../support/fake-ip-hasher'
import { fixedClock } from '../../support/fixed-clock'
import { InMemoryContactMessageRepository } from '../../support/in-memory-contact-message-repository'

const NOW = '2026-09-30T12:00:00Z'
const nowMs = new Date(NOW).getTime()
const validRaw = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  topic: 'project',
  message: 'Bonjour, je voudrais discuter d’un projet.',
  locale: 'fr',
  website: '',
  startedAt: String(nowMs - MIN_FILL_MS - 2000),
}

type Overrides = { recentCount?: number; failOnSave?: boolean; notify?: () => Promise<void> }

function setup(over: Overrides = {}) {
  const messages = new InMemoryContactMessageRepository({
    recentCount: over.recentCount ?? 0,
    failOnSave: over.failOnSave ?? false,
  })
  const notified: unknown[] = []
  const notifier = {
    notify:
      over.notify ??
      (async (message: unknown) => {
        notified.push(message)
      }),
  }
  const useCase = new SubmitContactMessage({
    messages,
    hasher: fakeIpHasher,
    clock: fixedClock(NOW),
    notifier,
  })
  return { useCase, messages, notified }
}

describe('SubmitContactMessage', () => {
  it('enregistre puis notifie une saisie valide', async () => {
    const { useCase, messages, notified } = setup()
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(1)
    expect(messages.saved[0]).toMatchObject({
      name: 'Ada Lovelace',
      ipHash: 'h(1.1.1.1)',
      locale: 'fr',
    })
    expect(notified).toHaveLength(1)
  })

  it('ne conserve pas l’adresse IP en clair, seulement son empreinte', async () => {
    const { useCase, messages } = setup()
    await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })
    expect(JSON.stringify(messages.saved)).not.toContain('1.1.1.1"')
  })

  it('renvoie les erreurs par champ sans rien enregistrer', async () => {
    const { useCase, messages } = setup()
    const result = await useCase.execute({ raw: { ...validRaw, message: 'court' }, ip: '1.1.1.1' })
    expect(result).toEqual({ status: 'invalid', fieldErrors: { message: 'tooShort' } })
    expect(messages.saved).toHaveLength(0)
  })

  it('répond ok en silence au honeypot rempli, sans rien enregistrer', async () => {
    const { useCase, messages } = setup()
    const result = await useCase.execute({
      raw: { ...validRaw, website: 'http://spam' },
      ip: '1.1.1.1',
    })
    expect(result).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(0)
  })

  it('répond ok en silence à une soumission trop rapide', async () => {
    const { useCase, messages } = setup()
    const result = await useCase.execute({
      raw: { ...validRaw, startedAt: String(nowMs - 1000) },
      ip: '1.1.1.1',
    })
    expect(result).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(0)
  })

  it("n'applique pas le time-trap sans startedAt (JS désactivé)", async () => {
    const { useCase, messages } = setup()
    const withoutTimestamp = { ...validRaw, startedAt: undefined }
    expect(await useCase.execute({ raw: withoutTimestamp, ip: '1.1.1.1' })).toEqual({
      status: 'ok',
    })
    expect(messages.saved).toHaveLength(1)
  })

  it('refuse au-delà de la limite de débit', async () => {
    const { useCase, messages } = setup({ recentCount: RATE_MAX })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({
      status: 'rate_limited',
    })
    expect(messages.saved).toHaveLength(0)
  })

  it("renvoie error si l'enregistrement échoue, sans notifier", async () => {
    const { useCase, notified } = setup({ failOnSave: true })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'error' })
    expect(notified).toHaveLength(0)
  })

  it('reste ok si la notification échoue (le message est déjà enregistré)', async () => {
    const { useCase } = setup({
      notify: async () => {
        throw new Error('smtp')
      },
    })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
  })

  it('fonctionne sans notifier configuré', async () => {
    const useCase = new SubmitContactMessage({
      messages: new InMemoryContactMessageRepository(),
      hasher: fakeIpHasher,
      clock: fixedClock(NOW),
    })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
  })
})

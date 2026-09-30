import { describe, expect, it } from 'vitest'
import { isHoneypotFilled, readStartedAt, validateContactDraft } from '@/domain'

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  topic: 'project',
  message: 'Bonjour, je voudrais discuter d’un projet.',
  locale: 'fr',
}

describe('validateContactDraft', () => {
  it('accepte une saisie valide et nettoie les espaces', () => {
    const result = validateContactDraft({ ...valid, name: '  Ada Lovelace  ' })
    expect(result).toEqual({ ok: true, value: { ...valid } })
  })

  it('remonte un code d’erreur par champ invalide', () => {
    const result = validateContactDraft({ ...valid, name: 'A', email: 'nope', message: 'court' })
    expect(result).toEqual({
      ok: false,
      error: { name: 'tooShort', email: 'emailInvalid', message: 'tooShort' },
    })
  })

  it('signale un champ manquant comme required', () => {
    const result = validateContactDraft({ ...valid, name: undefined })
    expect(result.ok === false && result.error.name).toBe('required')
  })

  it('signale un champ fait uniquement d’espaces comme required', () => {
    const result = validateContactDraft({ ...valid, message: '     ' })
    expect(result.ok === false && result.error.message).toBe('required')
  })

  it('signale un message trop long', () => {
    const result = validateContactDraft({ ...valid, message: 'x'.repeat(2001) })
    expect(result.ok === false && result.error.message).toBe('tooLong')
  })

  it('accepte un message de la longueur maximale exactement', () => {
    expect(validateContactDraft({ ...valid, message: 'x'.repeat(2000) }).ok).toBe(true)
  })

  it('rejette un sujet hors liste', () => {
    const result = validateContactDraft({ ...valid, topic: 'spam' })
    expect(result.ok === false && result.error.topic).toBe('required')
  })

  it('ignore les valeurs qui ne sont pas du texte (fichier, nombre)', () => {
    const result = validateContactDraft({ ...valid, name: 42, email: new Blob(['x']) })
    expect(result.ok === false && result.error).toMatchObject({
      name: 'required',
      email: 'required',
    })
  })

  it('retombe sur la langue par défaut si la locale est inconnue', () => {
    const result = validateContactDraft({ ...valid, locale: 'de' })
    expect(result.ok && result.value.locale).toBe('fr')
  })
})

describe('anti-spam helpers', () => {
  it('détecte le honeypot rempli', () => {
    expect(isHoneypotFilled({ website: 'http://spam' })).toBe(true)
    expect(isHoneypotFilled({ website: '  ' })).toBe(false)
    expect(isHoneypotFilled({})).toBe(false)
  })
  it('lit startedAt seulement s’il est numérique', () => {
    expect(readStartedAt({ startedAt: '1700000000000' })).toBe(1_700_000_000_000)
    expect(readStartedAt({ startedAt: 'abc' })).toBeUndefined()
    expect(readStartedAt({})).toBeUndefined()
  })
  it('ne lit pas startedAt quand il est vide ou nul', () => {
    expect(readStartedAt({ startedAt: '' })).toBeUndefined()
    expect(readStartedAt({ startedAt: null })).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'
import { err, ok, type Result } from '@/domain'

/** Consommateur type : TypeScript n'autorise `.value` / `.error` qu'après discrimination sur `ok`. */
function describeOutcome(result: Result<number, string>): string {
  if (result.ok) return `valeur ${result.value}`
  return `erreur ${result.error}`
}

describe('Result', () => {
  it('ok enveloppe une valeur de succès', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 })
  })

  it('err enveloppe une erreur attendue', () => {
    expect(err('x')).toEqual({ ok: false, error: 'x' })
  })

  it('se discrimine sur ok pour lire la valeur', () => {
    expect(describeOutcome(ok(1))).toBe('valeur 1')
  })

  it('se discrimine sur ok pour lire l’erreur', () => {
    expect(describeOutcome(err('x'))).toBe('erreur x')
  })
})

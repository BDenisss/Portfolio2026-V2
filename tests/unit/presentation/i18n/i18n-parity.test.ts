import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { NAMESPACES } from '@/presentation/i18n/namespaces'

type Messages = Record<string, unknown>

const read = (locale: string, namespace: string) =>
  JSON.parse(
    readFileSync(`src/presentation/i18n/messages/${locale}/${namespace}.json`, 'utf8'),
  ) as Messages

const flatten = (messages: Messages, prefix = ''): Array<[string, unknown]> =>
  Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? flatten(value as Messages, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value] as [string, unknown]],
  )

describe('parité des messages FR/EN', () => {
  it('mêmes fichiers dans fr/ et en/, exactement les namespaces du contrat', () => {
    const expected = [...NAMESPACES].map((namespace) => `${namespace}.json`).sort()
    expect(readdirSync('src/presentation/i18n/messages/fr').sort()).toEqual(expected)
    expect(readdirSync('src/presentation/i18n/messages/en').sort()).toEqual(expected)
  })
  it.each([...NAMESPACES])('%s : mêmes clés, aucune chaîne vide', (namespace) => {
    const fr = flatten(read('fr', namespace))
    const en = flatten(read('en', namespace))
    expect(en.map(([key]) => key).sort()).toEqual(fr.map(([key]) => key).sort())
    for (const [key, value] of [...fr, ...en]) {
      expect(typeof value === 'string' && value.trim().length > 0, `${namespace}.${key}`).toBe(true)
    }
  })
})

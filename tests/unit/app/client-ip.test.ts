import { describe, expect, it } from 'vitest'
import { clientIp } from '@/app/(site)/[locale]/(shell)/_actions/client-ip'

describe('clientIp', () => {
  it('prend la première adresse de x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))).toBe('9.9.9.9')
  })
  it('se replie sur x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8')
  })
  it('renvoie 0.0.0.0 par défaut', () => {
    expect(clientIp(new Headers())).toBe('0.0.0.0')
  })
  it('ignore les espaces autour de l’adresse', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '  9.9.9.9  ' }))).toBe('9.9.9.9')
  })
})
